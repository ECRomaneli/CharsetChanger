/**
 * MODULE STATIC EXPORTS
 */
/**
 * Change charset.
 * @param config Used to config the CharsetChanger before convert.
 */
export declare function charsetChanger(config: charsetChanger.Config): Promise<void>;
/**
 * Change charset sync.
 * @param config Used to config the CharsetChanger before convert.
 */
export declare function charsetChangerSync(config: charsetChanger.Config): void;
/**
 * MODULE CORE
 */
export declare enum Charset {
    UCS2 = "ucs2",
    UTF7 = "UTF-7",
    UTF7_IMAP = "UTF-7-IMAP",
    UTF16 = "UTF16",
    UTF32 = "UTF32",
    ASCII = "ascii",
    BINARY = "binary",
    BASE64 = "base64",
    HEX = "hex",
    WIN1252 = "windows-1252",
    CP1252 = "windows-1252",
    LATIN1 = "ISO-8859-1",
    UTF8 = "UTF-8",
    UTF16_LE = "UTF-16 LE",
    UTF16_BE = "UTF-16 BE",
    UTF32_LE = "UTF-32 LE",
    UTF32_BE = "UTF-32 BE",
    ISO2022_JP = "ISO-2022-JP",
    ISO2022_KR = "ISO-2022-KR",
    ISO2022_CN = "ISO-2022-CN",
    SHIFT_JIS = "Shift-JIS",
    BIG5 = "Big5",
    EUC_JP = "EUC-JP",
    EUC_KR = "EUC-KR",
    GB18030 = "GB18030",
    ISO8859_1 = "ISO-8859-1",
    ISO8859_2 = "ISO-8859-2",
    ISO8859_5 = "ISO-8859-5",
    ISO8859_6 = "ISO-8859-6",
    ISO8859_7 = "ISO-8859-7",
    ISO8859_8 = "ISO-8859-8",
    ISO8859_9 = "ISO-8859-9",
    WINDOWS_1250 = "windows-1250",
    WINDOWS_1251 = "windows-1251",
    WINDOWS_1252 = "windows-1252",
    WINDOWS_1253 = "windows-1253",
    WINDOWS_1254 = "windows-1254",
    WINDOWS_1255 = "windows-1255",
    WINDOWS_1256 = "windows-1256",
    KOI8_R = "KOI8-R"
}
export declare namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean | void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type MessageList = {
        file: FilePath;
        message: string;
    }[];
    export type OnFinish = (status: boolean, messageList: MessageList) => boolean | void;
    export type DetectorFilter = (path: FilePath, charset: Charset) => boolean | void;
    type FilePath = string;
    type GlobString = string;
    export type Config = {
        root: string;
        search?: GlobString;
        ignore?: GlobString;
        from?: Charset;
        to: Charset;
        createBackup?: boolean;
        backupSuffix?: string;
        onList?: OnList;
        onBeforeConvert?: OnBeforeConvert;
        onAfterConvert?: OnAfterConvert;
        onFinish?: OnFinish;
        detectorFilter?: DetectorFilter;
    };
    export class Class {
        private _root;
        private _search;
        private _ignore;
        private _from;
        private _to;
        private _onList;
        private _onBeforeConvert;
        private _onAfterConvert;
        private _onFinish;
        private _detectorFilter;
        private _createBackup;
        private backupSuffix;
        private _messageList;
        constructor();
        private tryConvert;
        private addMessage;
        private rootPath;
        private detectCharset;
        private getDecodedData;
        private setEncodedData;
        private createBackup;
        private listFiles;
        private changeCharset;
        private startConvert;
        convert(): Promise<void>;
        convertSync(): void;
        root(): FilePath;
        root(root: FilePath): this;
        search(): GlobString;
        search(search: GlobString): this;
        ignore(): GlobString;
        ignore(ignore: GlobString): this;
        from(): Charset;
        from(from: Charset): this;
        to(): Charset;
        to(to: Charset): this;
        backup(): string;
        backup(backupSuffix: string): this;
        backup(createBackup: boolean): this;
        backup(backupSuffix: string, createBackup: boolean): this;
        onList(onList: OnList): this;
        onBeforeConvert(onBeforeConvert: OnBeforeConvert): this;
        onAfterConvert(onAfterConvert: OnAfterConvert): this;
        onFinish(onFinish: OnFinish): this;
        detectorFilter(detectorFilter: DetectorFilter): this;
        setConfig(config: Config): this;
    }
    export const instance: Class;
    export {};
}
/**
 * MODULE EXPORTS
 */
export declare type CharsetChanger = charsetChanger.Class;
export declare const Class: typeof charsetChanger.Class;
export declare const CharsetChanger: typeof charsetChanger.Class;
