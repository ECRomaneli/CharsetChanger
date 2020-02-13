/**
 * MODULE STATIC EXPORTS
 */
export declare function charsetChanger(config: charsetChanger.Config): Promise<boolean>;
export declare function charsetChangerSync(config: charsetChanger.Config): boolean;
/**
 * MODULE CORE
 */
export declare enum Charset {
    UCS2 = "ucs2",
    UTF7 = "utf-7",
    UTF7_IMAP = "utf-7-imap",
    UTF8 = "utf8",
    UTF16 = "utf16",
    UTF16_LE = "utf16-le",
    UTF16_BE = "utf16-le",
    UTF32 = "utf32",
    UTF32_LE = "utf32-le",
    UTF32_BE = "utf32-le",
    ASCII = "ascii",
    BINARY = "binary",
    BASE64 = "base64",
    HEX = "hex",
    WIN1252 = "cp1252",
    CP1252 = "cp1252",
    ISO8859_1 = "iso8859-1",
    LATIN1 = "iso8859-1"
}
export declare namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean | void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type OnFinish = (status: boolean) => boolean | void;
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
    };
    export class Class {
        static DEFAULT_BACKUP_SUFFIX: string;
        static DEFAULT_LISTENER: () => void;
        private _root;
        private _search;
        private _ignore;
        private _from;
        private _to;
        private _onList;
        private _onBeforeConvert;
        private _onAfterConvert;
        private _onFinish;
        private _createBackup;
        private backupSuffix;
        private rootPath;
        private createBackup;
        private getDecodedData;
        private setEncodedData;
        private listFiles;
        private changeCharset;
        private startConvert;
        convert(): Promise<boolean>;
        convertSync(): boolean;
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
        setConfig(config: Config): this;
    }
    export const STATIC_INSTANCE: Class;
    export {};
}
/**
 * MODULE EXPORTS
 */
export declare type CharsetChanger = charsetChanger.Class;
export declare const Class: typeof charsetChanger.Class;
export declare const CharsetChanger: typeof charsetChanger.Class;
