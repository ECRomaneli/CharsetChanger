export declare function charsetChangerSync(config: charsetChanger.Config): boolean;
export declare namespace charsetChanger {
    export type Handler<T> = (argA?: T, argB?: any, argC?: any) => T;
    type FilePath = string;
    type GlobString = string;
    export enum Charset {
        UTF8 = "utf-8",
        UTF8_BOM = "utf-8 with bom",
        CP1252 = "cp1252"
    }
    export type Config = {
        rootPath: string;
        level?: number;
        search?: GlobString;
        exclude?: GlobString;
        from?: Charset;
        to: Charset;
        backup?: boolean;
        backupSuffix?: string;
        onList?: Handler<FilePath[]>;
        onBeforeConvert?: Handler<FilePath>;
        onAfterConvert?: Handler<FilePath>;
        onFinish?: Handler<boolean>;
    };
    export class Class {
        private rootPath;
        private level;
        private _search;
        private _from;
        private _to;
        private _onList;
        private _onBeforeConvert;
        private _onAfterConvert;
        private _onFinish;
        private backup;
        private backupSuffix;
        private createBackup;
        private listFiles;
        private changeCharset;
        convertSync(): boolean;
        getRootPath(): string;
        setRootPath(rootPath: string): void;
        getLevel(): number;
        setLevel(level: number): void;
        getSearch(): GlobString;
        setSearch(_search: GlobString): void;
        getFrom(): Charset;
        setFrom(from: Charset): void;
        getTo(): Charset;
        setTo(to: Charset): void;
        getBackup(): boolean;
        setBackup(backup: boolean): void;
        getBackupSuffix(): string;
        setBackupSuffix(backupSuffix: string): void;
        search(search: GlobString): void;
        to(to: Charset): void;
        from(from: Charset): void;
        onList(onList: Handler<FilePath[]>): void;
        onBeforeConvert(onBeforeConvert: Handler<FilePath>): void;
        onAfterConvert(onAfterConvert: Handler<FilePath>): void;
        onFinish(onFinish: Handler<boolean>): void;
        setConfig(config: Config): this;
    }
    export const STATIC_INSTANCE: Class;
    export {};
}
