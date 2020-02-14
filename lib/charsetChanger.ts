/**
 * MODULE STATIC EXPORTS
 */

 /**
  * Change charset. 
  * @param config Used to config the CharsetChanger before convert.
  */
export function charsetChanger(config: charsetChanger.Config): Promise<void> {
    return charsetChanger.instance.setConfig(config).convert();
}

/**
 * Change charset sync.
 * @param config Used to config the CharsetChanger before convert.
 */
export function charsetChangerSync(config: charsetChanger.Config): void {
    charsetChanger.instance.setConfig(config).convertSync();
}

/**
 * MODULE CORE
 */

export enum Charset {
    UCS2 = 'ucs2',
    UTF7 = 'UTF-7',
    UTF7_IMAP = 'UTF-7-IMAP',
    UTF16 = 'UTF16',
    UTF32 = 'UTF32',
    ASCII = 'ascii', 
    BINARY = 'binary', 
    BASE64 = 'base64', 
    HEX = 'hex',
    WIN1252 = 'windows-1252',
    CP1252 = 'windows-1252',
    LATIN1 = 'ISO-8859-1',
    // CHARDET
    UTF8 = 'UTF-8',
    UTF16_LE = 'UTF-16 LE',
    UTF16_BE = 'UTF-16 BE',
    UTF32_LE = 'UTF-32 LE',
    UTF32_BE = 'UTF-32 BE',
    ISO2022_JP = 'ISO-2022-JP',
    ISO2022_KR = 'ISO-2022-KR',
    ISO2022_CN = 'ISO-2022-CN',
    SHIFT_JIS = 'Shift-JIS',
    BIG5 = 'Big5',
    EUC_JP = 'EUC-JP',
    EUC_KR = 'EUC-KR',
    GB18030 = 'GB18030',
    ISO8859_1 = 'ISO-8859-1',
    ISO8859_2 = 'ISO-8859-2',
    ISO8859_5 = 'ISO-8859-5',
    ISO8859_6 = 'ISO-8859-6',
    ISO8859_7 = 'ISO-8859-7',
    ISO8859_8 = 'ISO-8859-8',
    ISO8859_9 = 'ISO-8859-9',
    WINDOWS_1250 = 'windows-1250',
    WINDOWS_1251 = 'windows-1251',
    WINDOWS_1252 = 'windows-1252',
    WINDOWS_1253 = 'windows-1253',
    WINDOWS_1254 = 'windows-1254',
    WINDOWS_1255 = 'windows-1255',
    WINDOWS_1256 = 'windows-1256',
    KOI8_R = 'KOI8-R'
}

export namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean|void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean|void;
    export type MessageList = { file: FilePath, message: string }[];
    export type OnFinish = (status: boolean, messageList: MessageList) => boolean|void;

    export type DetectorFilter = (path: FilePath, charset: Charset) => boolean|void;
    
    type FilePath = string;
    type GlobString = string;
    const fs = require('fs');
    const { glob } = require('glob');
    const chardet = require('chardet');
    const iconv = require('iconv-lite');

    const DEFAULT_BACKUP_SUFFIX: string = '.bkp';
    const DEFAULT_LISTENER = () => {};
    const MAX_SAMPLE_SIZE = 200000;
    
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
        onFinish?: OnFinish,
        detectorFilter?: DetectorFilter
    };
    
    export class Class {
        private _root: string;
        private _search: GlobString;
        private _ignore: GlobString;
        private _from: Charset;
        private _to: Charset;
        private _onList: OnList;
        private _onBeforeConvert: OnBeforeConvert;
        private _onAfterConvert: OnAfterConvert;
        private _onFinish: OnFinish;
        private _detectorFilter: DetectorFilter;
        private _createBackup: boolean;
        private backupSuffix: string;
        private _messageList: MessageList;

        constructor () { this._messageList = []; }

        private tryConvert(tryFn: Function): void {
            try {
                tryFn();
                this._onFinish(true, this._messageList);
            } catch(err) {
                debug('error',err,true);
                this._onFinish(false, this._messageList);
            }
        }

        private addMessage(file: FilePath, message: string, throwErr?: boolean): void {
            this._messageList.push({file, message});
            if (throwErr) { throw message; }
        }

        private rootPath(relativePath: FilePath): FilePath {
            return this._root + relativePath;
        }

        private detectCharset(path: FilePath, buffer: Buffer): Charset {
            let charset: Charset = chardet.detect(buffer, { sampleSize: MAX_SAMPLE_SIZE });
            if (!iconv.encodingExists(charset)) {
                this.addMessage(path, EncodingNotSupportedMessage(charset));
            } else if (this._to === this._from) {
                this.addMessage(path, SkippingConversionMessage(path, `The file is already ${charset}`));
            } else if (not(this._detectorFilter(path, charset))) {
                this.addMessage(path, SkippingConversionMessage(path, `Charset: ${charset}`));
            } else {
                return charset;
            }
            return null;
        }

        private getDecodedData(path: FilePath): string {
            let fileBuffer: Buffer = fs.readFileSync(this.rootPath(path));
            let from: Charset = this._from || this.detectCharset(path, fileBuffer);
            if (!from) { return null; }
            return iconv.decode(fs.readFileSync(this.rootPath(path)), from);
        }

        private setEncodedData(path: FilePath, data: string): void {
            fs.writeFileSync(this.rootPath(path), iconv.encode(data, this._to));
        }

        private createBackup(path: FilePath): void {
            if (this._createBackup) {
                path = this.rootPath(path);
                fs.copyFileSync(path, path + this.backupSuffix);
            }
        }

        private listFiles(): FilePath[] {
            try {
                let pathArr: FilePath[] = glob.sync(this._search, {
                    cwd: this._root, ignore: this._ignore, nodir: true
                });
                if (not(this._onList(pathArr))) {
                    this.addMessage(null, ListenerMessage('onList'), true);
                }
                return pathArr;
            } catch (err) {
                debug('error', err, true);
                return [];
            }
        }

        private changeCharset(path: FilePath, index?: number, pathArr?: FilePath[]): void {
            let data: string = this.getDecodedData(path);

            if (not(this._onBeforeConvert(path, data, index, pathArr))) {
                this.addMessage(path, ListenerMessage('onBeforeConvert'));
                return;
            }
            
            this.createBackup(path);
            this.setEncodedData(path, data);

            if (not(this._onAfterConvert(path, data, index, pathArr))) {
                this.addMessage(path, ListenerMessage('onBeforeConvert'), true);
            }
        }

        private startConvert(): void {
            let pathArr: FilePath[] = this.listFiles();
            this.tryConvert(() => pathArr.forEach((f,i,arr) => this.changeCharset(f,i,arr)));
        }

        public async convert(): Promise<void> {
            this.startConvert();
        }

        public convertSync(): void {
            this.startConvert();
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
            if (from !== null && !iconv.encodingExists(from)) {
                throw EncodingNotSupportedMessage(from);
            }
            this._from = from;
            return this;
        }

        public to(): Charset;
        public to(to: Charset): this;
        public to(to?: Charset): this|Charset {
            if (to === void 0) { return this._to; }
            if (!iconv.encodingExists(to)) {
                throw EncodingNotSupportedMessage(to);
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
            this.backupSuffix = BSOrCB !== void 0 ? BSOrCB : DEFAULT_BACKUP_SUFFIX;
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

        public detectorFilter(detectorFilter: DetectorFilter): this {
            this._detectorFilter = detectorFilter;
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
                .onList(config.onList || DEFAULT_LISTENER)
                .onBeforeConvert(config.onBeforeConvert || DEFAULT_LISTENER)
                .onAfterConvert (config.onAfterConvert || DEFAULT_LISTENER)
                .onFinish(config.onFinish || DEFAULT_LISTENER)
                .detectorFilter(config.detectorFilter || DEFAULT_LISTENER);
        }
    }

    export const instance = new Class();

    const SkippingConversionMessage = (p, m) => `Skipping "${p}" conversion. ${m}.`;
    const ListenerMessage = (lName) => `The ${lName} listener returned false.`;
    const EncodingNotSupportedMessage = (c) => `Encoding ${c} is not supported!`;

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
}

/**
 * MODULE EXPORTS
 */
export type CharsetChanger = charsetChanger.Class;
export const Class = charsetChanger.Class;
export const CharsetChanger = Class;