export function charsetChanger(config: charsetChanger.Config): Promise<boolean> {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convert();
}

export function charsetChangerSync(config: charsetChanger.Config): boolean {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convertSync();
}

export namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean|void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type OnFinish = (status: boolean) => boolean|void;
    
    type FilePath = string;
    type GlobString = string;
    const { glob } = require('glob');
    const encoding = require('encoding');
    const fs = require('fs');

    export enum Charset {
        UTF8 = 'utf-8',
        UTF8_BOM = 'utf-8 with bom',
        CP1252 = 'cp1252'
    }
    
    export type Config = {
        root: string,
        search?: GlobString,
        ignore?: GlobString,
        from?: Charset,
        to: Charset,
        createBackup?: boolean,
        backupSuffix?: string,
        onList?: OnList,
        onBeforeConvert?: OnBeforeConvert,
        onAfterConvert?: OnAfterConvert,
        onFinish?: OnFinish
    };
    
    export class Class {
        static DEFAULT_BACKUP_SUFFIX: string = '.bkp';
        static DEFAULT_LISTENER = () => {};
        private _root: string;
        private _search: GlobString;
        private _ignore: GlobString;
        private _from: Charset;
        private _to: Charset;
        private _onList: OnList;
        private _onBeforeConvert: OnBeforeConvert;
        private _onAfterConvert: OnAfterConvert;
        private _onFinish: OnFinish;
        private _createBackup: boolean;
        private backupSuffix: string;

        private createBackup(path: FilePath, data: string): void {
            if (!this._createBackup) { return; }
            path += this.backupSuffix;
            fs.writeFileSync(path, data, { encoding: this._from });
        }

        private listFiles(): FilePath[] {
            try {
                let pathArr: FilePath[] = glob.sync(this._search, {
                    cwd: this._root, ignore: this._ignore, cache: 'FILE' 
                });
                if (this._onList(pathArr) === false) {
                    throw 'Aborted by onList listener.';
                }
                return pathArr;
            } catch (err) {
                debug('error', err, true);
                return [];
            }
        }

        private changeCharset(path: FilePath, index?: number, pathArr?: FilePath[]): void {
            try {
                let rootPath = this.rootPath(path);
                let data = fs.readFileSync(rootPath, { encoding: this._from });

                if (this._onBeforeConvert(path, data, index, pathArr) === false) {
                    throw 'Aborted by onBeforeConvert listener.';
                }
                
                this.createBackup(rootPath, data);
                fs.writeFileSync(rootPath, data, { encoding: this._to });
    
                if (this._onAfterConvert(path, data, index, pathArr) === false) {
                    throw 'Aborted by onAfterConvert listener.';
                }
            } catch (err) { debug('error', err, true); }
        }

        private rootPath(relativePath: FilePath): FilePath {
            debug('info', this._root + relativePath);
            return this._root + relativePath;
        }

        private convertFileArr(): boolean {
            let pathArr: FilePath[] = this.listFiles();
            let status: boolean = test(() => pathArr.forEach((f,i,arr) => this.changeCharset(f,i,arr)));
            this._onFinish(status);
            return status;
        }

        public async convert(): Promise<boolean> {
            return this.convertFileArr();
        }

        public convertSync(): boolean {
            return this.convertFileArr();
        }

        public root(): FilePath;
        public root(root: FilePath): this;
        public root(root?: FilePath): this|FilePath {
            if (root === void 0) { return this._root; }
            this._root = root.charAt(root.length-1)!=='/'?root+'/':root;
            return this;
        }

        public search(): GlobString;
        public search(search: GlobString): this;
        public search(search?: GlobString): this|GlobString {
            if (search === void 0) { return this._search; }
            this._search = search;
            return this;
        }

        public ignore(): GlobString;
        public ignore(ignore: GlobString): this;
        public ignore(ignore?: GlobString): this|GlobString {
            if (ignore === void 0) { return this._ignore; }
            this._ignore = ignore;
            return this;
        }

        public from(): Charset;
        public from(from: Charset): this;
        public from(from?: Charset): this|Charset {
            if (from === void 0) { return this._from; }
            this._from = from;
            return this;
        }

        public to(): Charset;
        public to(to: Charset): this;
        public to(to?: Charset): this|Charset {
            if (to === void 0) { return this._to; }
            this._to = to;
            return this;
        }

        public backup(): string;
        public backup(createBackup: boolean): this;
        public backup(backupSuffix: string): this;
        public backup(backupSuffix: string, createBackup: boolean): this;
        public backup(BSOrCB?: string|boolean, createBackup?: boolean): this|string {
            if (BSOrCB === void 0) { return this.backupSuffix; }
            if (typeof BSOrCB === 'boolean') {
                this._createBackup = BSOrCB;
                if (BSOrCB && this.backupSuffix === void 0) {
                    this.backupSuffix = Class.DEFAULT_BACKUP_SUFFIX;
                }
                return this;
            }
            this._createBackup = createBackup === void 0 ? createBackup : !!BSOrCB;
            this.backupSuffix = BSOrCB;
            return this;
        }

        public onList(onList: OnList): this {
            this._onList = onList;
            return this;
        }

        public onBeforeConvert(onBeforeConvert: OnBeforeConvert): this {
            this._onBeforeConvert = onBeforeConvert;
            return this;
        }

        public onAfterConvert(onAfterConvert: OnAfterConvert): this {
            this._onAfterConvert = onAfterConvert;
            return this;
        }

        public onFinish(onFinish: OnFinish): this {
            this._onFinish = onFinish;
            return this;
        }

        public setConfig(config: Config): this {
            return this .root(config.root || null)
                        .search(config.search || '**/*')
                        .ignore(config.ignore || null)
                        .from(config.from || null)
                        .to(config.to || null)
                        .backup(config.backupSuffix || Class.DEFAULT_BACKUP_SUFFIX, config.createBackup)
                        .onList(config.onList || Class.DEFAULT_LISTENER)
                        .onBeforeConvert(config.onBeforeConvert || Class.DEFAULT_LISTENER)
                        .onAfterConvert (config.onAfterConvert || Class.DEFAULT_LISTENER)
                        .onFinish(config.onFinish || Class.DEFAULT_LISTENER);
        }
    }

    export const STATIC_INSTANCE = new Class();

    function debug(debugType: string, message?: any, throwErr?: boolean): void {
        if (debugType === 'none') { return; }
        if (throwErr && debugType === 'error') {
            throw `[CharsetChanger] ${message}`;
        }
        console[debugType]('[CharsetChanger]', message);
    }

    function test(assert: Function, throwErr?: boolean): boolean {
        try {
            assert();
            return true;
        } catch (err) {
            debug('error', err, throwErr);
            return false;
        }
    }
}