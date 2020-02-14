/**
 * MODULE STATIC EXPORTS
 */

export function charsetChanger(config: charsetChanger.Config): Promise<boolean> {
    return charsetChanger.instance.setConfig(config).convert();
}

export function charsetChangerSync(config: charsetChanger.Config): boolean {
    return charsetChanger.instance.setConfig(config).convertSync();
}

/**
 * MODULE CORE
 */

export enum Charset {
    UCS2 = 'ucs2',
    UTF7 = 'utf-7',
    UTF7_IMAP = 'utf-7-imap',
    UTF8 = 'utf8', 
    UTF16 = 'utf16',
    UTF16_LE = 'utf16-le',
    UTF16_BE = 'utf16-le', 
    UTF32 = 'utf32',
    UTF32_LE = 'utf32-le',
    UTF32_BE = 'utf32-le', 
    ASCII = 'ascii', 
    BINARY = 'binary', 
    BASE64 = 'base64', 
    HEX = 'hex',
    WIN1252 = 'cp1252',
    CP1252 = 'cp1252',
    ISO8859_1 = 'iso8859-1',
    LATIN1 = 'iso8859-1'
}

export namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean|void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type OnFinish = (status: boolean) => boolean|void;
    
    type FilePath = string;
    type GlobString = string;
    const fs = require('fs');
    const { glob } = require('glob');
    const iconv = require('iconv-lite');
    
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

        private rootPath(relativePath: FilePath): FilePath {
            return this._root + relativePath;
        }

        private createBackup(path: FilePath): void {
            if (this._createBackup) {
                path = this.rootPath(path);
                fs.copyFileSync(path, path + this.backupSuffix);
            }
        }

        private getDecodedData(path: FilePath, from: Charset): string {
            return iconv.decode(fs.readFileSync(this.rootPath(path)), from);
        }

        private setEncodedData(path: FilePath, data: string, to: Charset): void {
            fs.writeFileSync(this.rootPath(path), iconv.encode(data, to));
        }

        private listFiles(): FilePath[] {
            try {
                let pathArr: FilePath[] = glob.sync(this._search, {
                    cwd: this._root, ignore: this._ignore, cache: 'FILE' 
                });
                if (not(this._onList(pathArr))) { throw ListenerException('onList'); }
                return pathArr;
            } catch (err) {
                debug('error', err, true);
                return [];
            }
        }

        private changeCharset(path: FilePath, index?: number, pathArr?: FilePath[]): void {
            try {
                let data: string = this.getDecodedData(path, this._from);

                if (not(this._onBeforeConvert(path, data, index, pathArr))) {
                    throw ListenerException('onBeforeConvert');
                }
                
                this.createBackup(path);
                this.setEncodedData(path, data, this._to);
    
                if (not(this._onAfterConvert(path, data, index, pathArr))) {
                    throw ListenerException('onAfterConvert');
                }
            } catch (err) { debug('error', err, true); }
        }

        private startConvert(): boolean {
            let pathArr: FilePath[] = this.listFiles();
            let status: boolean = tryExecute(() => pathArr.forEach((f,i,arr) => this.changeCharset(f,i,arr)));
            this._onFinish(status);
            return status;
        }

        public async convert(): Promise<boolean> {
            return this.startConvert();
        }

        public convertSync(): boolean {
            return this.startConvert();
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
            if (!iconv.encodingExists(from)) {
                throw `Encoding ${from} is not supported!`;
            }
            this._from = from;
            return this;
        }

        public to(): Charset;
        public to(to: Charset): this;
        public to(to?: Charset): this|Charset {
            if (to === void 0) { return this._to; }
            if (!iconv.encodingExists(to)) {
                throw `Encoding ${to} is not supported!`;
            }
            this._to = to;
            return this;
        }

        public backup(): string;
        public backup(backupSuffix: string): this;
        public backup(createBackup: boolean): this;
        public backup(backupSuffix: string, createBackup: boolean): this;
        public backup(BSOrCB?: string|boolean, createBackup?: boolean): this|string {
            if (BSOrCB === void 0 && createBackup === void 0) { return this.backupSuffix; }
            if (typeof BSOrCB === 'boolean') { return this.backup(void 0, BSOrCB); }
            this._createBackup = createBackup !== void 0 ? createBackup : true;
            this.backupSuffix = BSOrCB !== void 0 ? BSOrCB : Class.DEFAULT_BACKUP_SUFFIX;
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
            return this 
                .root(config.root || null)
                .search(config.search || '**/*')
                .ignore(config.ignore || null)
                .from(config.from || null)
                .to(config.to || null)
                .backup(config.backupSuffix, config.createBackup || !!config.backupSuffix)
                .onList(config.onList || Class.DEFAULT_LISTENER)
                .onBeforeConvert(config.onBeforeConvert || Class.DEFAULT_LISTENER)
                .onAfterConvert (config.onAfterConvert || Class.DEFAULT_LISTENER)
                .onFinish(config.onFinish || Class.DEFAULT_LISTENER);
        }
    }

    export const instance = new Class();

    function ListenerException(listenerName: string): string {
        return `Aborted by ${listenerName} listener.`
    }

    function not(value: any): boolean {
        return value === false;
    }

    function debug(debugType: string, message?: any, throwErr?: boolean): any {
        if (debugType === 'none') { return; }
        if (throwErr && debugType === 'error') {
            throw `[CharsetChanger] ${message}`;
        }
        console[debugType]('[CharsetChanger]', message);
    }

    function tryExecute(tryFn: Function, throwErr?: boolean): boolean {
        try{return tryFn()||true}catch(err){return debug('error',err,throwErr)&&false}
    }
}

/**
 * MODULE EXPORTS
 */
export type CharsetChanger = charsetChanger.Class;
export const Class = charsetChanger.Class;
export const CharsetChanger = Class;