// export function charsetChanger(config: charsetChanger.Config): boolean {
//     return charsetChanger.STATIC_INSTANCE.setConfig(config).convert();
// }

export function charsetChangerSync(config: charsetChanger.Config): boolean {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convertSync();
}

export namespace charsetChanger {
    export type Handler<T> = (argA?: T, argB?, argC?) => T;

    type FilePath = string;
    type GlobString = string;
    const { glob } = require('glob');
    const encoding = require('encoding');
    const fs = require('fs');
    const GENERIC_HANDLER = (any?: any) => any;

    export enum Charset {
        UTF8 = 'utf-8',
        UTF8_BOM = 'utf-8 with bom',
        CP1252 = 'cp1252'
    }
    
    export type Config = {
        rootPath: string,
        level?: number,
        search?: GlobString,
        exclude?: GlobString,
        from?: Charset,
        to: Charset,
        backup?: boolean,
        backupSuffix?: string,
        onList?: Handler<FilePath[]>,
        onBeforeConvert?: Handler<FilePath>,
        onAfterConvert?: Handler<FilePath>,
        onFinish?: Handler<boolean>
    };
    
    export class Class {
        private rootPath: string;
        private level: number;
        private _search: GlobString;
        private _from: Charset;
        private _to: Charset;
        private _onList: Handler<FilePath[]> = GENERIC_HANDLER;
        private _onBeforeConvert: Handler<FilePath> = GENERIC_HANDLER;
        private _onAfterConvert: Handler<FilePath> = GENERIC_HANDLER;
        private _onFinish: Handler<boolean>;
        private backup: boolean;
        private backupSuffix: string;

        private createBackup(file: FilePath, fileData: string): void {
            if (!this.backup) { return; }
            file += this.backupSuffix;
            fs.writeFileSync(file, fileData, { encoding: this._from });
        }

        private listFiles(): FilePath[] {
            try {
                return this._onList(glob.sync(this.rootPath + this._search, { cache: 'FILE' }));
            } catch (err) { debug('error', err, true); }
            return void 0;
        }

        private changeCharset(file: FilePath, index?: number, fileArr?: FilePath[]): void {
            console.log(arguments);
            file = this._onBeforeConvert(file, index, fileArr);

            let fileData = fs.readFileSync(file, { encoding: this._from });
            this.createBackup(file, fileData);
            fs.writeFileSync(file, fileData, { encoding: this._to });

            file = this._onAfterConvert(file, index, fileArr);
        }

        public convertSync(): boolean {
            let fileArr: FilePath[] = this.listFiles();
            let status: boolean = test(() => fileArr.forEach((a,b,c) => this.changeCharset(a,b,c)));
            return this._onFinish(status, fileArr);
        }

        public getRootPath(): string { return this.rootPath; }
        public setRootPath(rootPath: string) { rootPath.charAt(rootPath.length-1)!=='/' && (rootPath+='/'); this.rootPath = rootPath; }
        public getLevel(): number { return this.level; }
        public setLevel(level: number) { this.level = level; }
        public getSearch(): GlobString { return this._search; }
        public setSearch(_search: GlobString) { this._search = _search; }
        public getFrom(): Charset { return this._from; }
        public setFrom(from: Charset) { this._from = from; }
        public getTo(): Charset { return this._to; }
        public setTo(to: Charset) { this._to = to; }
        public getBackup(): boolean { return this.backup; }
        public setBackup(backup: boolean) { this.backup = backup; }
        public getBackupSuffix(): string { return this.backupSuffix; }
        public setBackupSuffix(backupSuffix: string) { this.backupSuffix = backupSuffix || '.bkp'; }
        public search(search: GlobString) { this.setSearch(search); }
        public to(to: Charset) { this.setTo(to); }
        public from(from: Charset) { this.setFrom(from); }

        public onList(onList: Handler<FilePath[]>): void {
            this._onList = onList || GENERIC_HANDLER;
        }

        public onBeforeConvert(onBeforeConvert: Handler<FilePath>): void {
            this._onBeforeConvert = onBeforeConvert || GENERIC_HANDLER;
        }

        public onAfterConvert(onAfterConvert: Handler<FilePath>): void {
            this._onAfterConvert = onAfterConvert || GENERIC_HANDLER;
        }

        public onFinish(onFinish: Handler<boolean>): void {
            this._onFinish = onFinish || GENERIC_HANDLER;
        }

        public setConfig(config: Config): this {
            this.setRootPath(config.rootPath);
            this.setLevel(config.level);
            this.setSearch(config.search);
            this.setFrom(config.from);
            this.setTo(config.to);
            this.setBackup(config.backup);
            this.setBackupSuffix(config.backupSuffix);

            this.onList(config.onList);
            this.onBeforeConvert(config.onBeforeConvert);
            this.onAfterConvert(config.onAfterConvert);
            this.onFinish(config.onFinish);
            
            return this;
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