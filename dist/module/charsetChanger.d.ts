export declare function charsetChanger(config: charsetChanger.Config): Promise<boolean>;
export declare function charsetChangerSync(config: charsetChanger.Config): boolean;
export declare namespace charsetChanger {
    export type OnList = (pathArr: FilePath[]) => boolean | void;
    export type OnBeforeConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type OnAfterConvert = (path: FilePath, data: string, index: number, pathArr: FilePath[]) => boolean | void;
    export type OnFinish = (status: boolean) => boolean | void;
    type FilePath = string;
    type GlobString = string;
    export enum Charset {
        UTF8 = "utf-8",
        UTF8_BOM = "utf-8 with bom",
        CP1252 = "cp1252"
    }
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
        private createBackup;
        private listFiles;
        private changeCharset;
        private rootPath;
        private convertFileArr;
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
        backup(createBackup: boolean): this;
        backup(backupSuffix: string): this;
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
