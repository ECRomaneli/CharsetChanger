"use strict";
// export function charsetChanger(config: charsetChanger.Config): boolean {
//     return charsetChanger.STATIC_INSTANCE.setConfig(config).convert();
// }
Object.defineProperty(exports, "__esModule", { value: true });
function charsetChangerSync(config) {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convertSync();
}
exports.charsetChangerSync = charsetChangerSync;
var charsetChanger;
(function (charsetChanger) {
    const { glob } = require('glob');
    const encoding = require('encoding');
    const fs = require('fs');
    const GENERIC_HANDLER = (any) => any;
    let Charset;
    (function (Charset) {
        Charset["UTF8"] = "utf-8";
        Charset["UTF8_BOM"] = "utf-8 with bom";
        Charset["CP1252"] = "cp1252";
    })(Charset = charsetChanger.Charset || (charsetChanger.Charset = {}));
    class Class {
        constructor() {
            this._onList = GENERIC_HANDLER;
            this._onBeforeConvert = GENERIC_HANDLER;
            this._onAfterConvert = GENERIC_HANDLER;
        }
        createBackup(file, fileData) {
            if (!this.backup) {
                return;
            }
            file += this.backupSuffix;
            fs.writeFileSync(file, fileData, { encoding: this._from });
        }
        listFiles() {
            try {
                return this._onList(glob.sync(this.rootPath + this._search, { cache: 'FILE' }));
            }
            catch (err) {
                debug('error', err, true);
            }
            return void 0;
        }
        changeCharset(file, index, fileArr) {
            console.log(arguments);
            file = this._onBeforeConvert(file, index, fileArr);
            let fileData = fs.readFileSync(file, { encoding: this._from });
            this.createBackup(file, fileData);
            fs.writeFileSync(file, fileData, { encoding: this._to });
            file = this._onAfterConvert(file, index, fileArr);
        }
        convertSync() {
            let fileArr = this.listFiles();
            let status = test(() => fileArr.forEach((a, b, c) => this.changeCharset(a, b, c)));
            return this._onFinish(status, fileArr);
        }
        getRootPath() { return this.rootPath; }
        setRootPath(rootPath) { rootPath.charAt(rootPath.length - 1) !== '/' && (rootPath += '/'); this.rootPath = rootPath; }
        getLevel() { return this.level; }
        setLevel(level) { this.level = level; }
        getSearch() { return this._search; }
        setSearch(_search) { this._search = _search; }
        getFrom() { return this._from; }
        setFrom(from) { this._from = from; }
        getTo() { return this._to; }
        setTo(to) { this._to = to; }
        getBackup() { return this.backup; }
        setBackup(backup) { this.backup = backup; }
        getBackupSuffix() { return this.backupSuffix; }
        setBackupSuffix(backupSuffix) { this.backupSuffix = backupSuffix || '.bkp'; }
        search(search) { this.setSearch(search); }
        to(to) { this.setTo(to); }
        from(from) { this.setFrom(from); }
        onList(onList) {
            this._onList = onList || GENERIC_HANDLER;
        }
        onBeforeConvert(onBeforeConvert) {
            this._onBeforeConvert = onBeforeConvert || GENERIC_HANDLER;
        }
        onAfterConvert(onAfterConvert) {
            this._onAfterConvert = onAfterConvert || GENERIC_HANDLER;
        }
        onFinish(onFinish) {
            this._onFinish = onFinish || GENERIC_HANDLER;
        }
        setConfig(config) {
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
    charsetChanger.Class = Class;
    charsetChanger.STATIC_INSTANCE = new Class();
    function debug(debugType, message, throwErr) {
        if (debugType === 'none') {
            return;
        }
        if (throwErr && debugType === 'error') {
            throw `[CharsetChanger] ${message}`;
        }
        console[debugType]('[CharsetChanger]', message);
    }
    function test(assert, throwErr) {
        try {
            assert();
            return true;
        }
        catch (err) {
            debug('error', err, throwErr);
            return false;
        }
    }
})(charsetChanger = exports.charsetChanger || (exports.charsetChanger = {}));
