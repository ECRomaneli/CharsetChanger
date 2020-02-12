"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function charsetChanger(config) {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convert();
}
exports.charsetChanger = charsetChanger;
function charsetChangerSync(config) {
    return charsetChanger.STATIC_INSTANCE.setConfig(config).convertSync();
}
exports.charsetChangerSync = charsetChangerSync;
(function (charsetChanger) {
    const { glob } = require('glob');
    const encoding = require('encoding');
    const fs = require('fs');
    let Charset;
    (function (Charset) {
        Charset["UTF8"] = "utf-8";
        Charset["UTF8_BOM"] = "utf-8 with bom";
        Charset["CP1252"] = "cp1252";
    })(Charset = charsetChanger.Charset || (charsetChanger.Charset = {}));
    class Class {
        createBackup(path, data) {
            if (!this._createBackup) {
                return;
            }
            path += this.backupSuffix;
            fs.writeFileSync(path, data, { encoding: this._from });
        }
        listFiles() {
            try {
                let pathArr = glob.sync(this._search, {
                    cwd: this._root, ignore: this._ignore, cache: 'FILE'
                });
                if (this._onList(pathArr) === false) {
                    throw 'Aborted by onList listener.';
                }
                return pathArr;
            }
            catch (err) {
                debug('error', err, true);
                return [];
            }
        }
        changeCharset(path, index, pathArr) {
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
            }
            catch (err) {
                debug('error', err, true);
            }
        }
        rootPath(relativePath) {
            debug('info', this._root + relativePath);
            return this._root + relativePath;
        }
        convertFileArr() {
            let pathArr = this.listFiles();
            let status = test(() => pathArr.forEach((f, i, arr) => this.changeCharset(f, i, arr)));
            this._onFinish(status);
            return status;
        }
        convert() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.convertFileArr();
            });
        }
        convertSync() {
            return this.convertFileArr();
        }
        root(root) {
            if (root === void 0) {
                return this._root;
            }
            this._root = root.charAt(root.length - 1) !== '/' ? root + '/' : root;
            return this;
        }
        search(search) {
            if (search === void 0) {
                return this._search;
            }
            this._search = search;
            return this;
        }
        ignore(ignore) {
            if (ignore === void 0) {
                return this._ignore;
            }
            this._ignore = ignore;
            return this;
        }
        from(from) {
            if (from === void 0) {
                return this._from;
            }
            this._from = from;
            return this;
        }
        to(to) {
            if (to === void 0) {
                return this._to;
            }
            this._to = to;
            return this;
        }
        backup(BSOrCB, createBackup) {
            if (BSOrCB === void 0) {
                return this.backupSuffix;
            }
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
        onList(onList) {
            this._onList = onList;
            return this;
        }
        onBeforeConvert(onBeforeConvert) {
            this._onBeforeConvert = onBeforeConvert;
            return this;
        }
        onAfterConvert(onAfterConvert) {
            this._onAfterConvert = onAfterConvert;
            return this;
        }
        onFinish(onFinish) {
            this._onFinish = onFinish;
            return this;
        }
        setConfig(config) {
            return this.root(config.root || null)
                .search(config.search || '**/*')
                .ignore(config.ignore || null)
                .from(config.from || null)
                .to(config.to || null)
                .backup(config.backupSuffix || Class.DEFAULT_BACKUP_SUFFIX, config.createBackup)
                .onList(config.onList || Class.DEFAULT_LISTENER)
                .onBeforeConvert(config.onBeforeConvert || Class.DEFAULT_LISTENER)
                .onAfterConvert(config.onAfterConvert || Class.DEFAULT_LISTENER)
                .onFinish(config.onFinish || Class.DEFAULT_LISTENER);
        }
    }
    Class.DEFAULT_BACKUP_SUFFIX = '.bkp';
    Class.DEFAULT_LISTENER = () => { };
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
