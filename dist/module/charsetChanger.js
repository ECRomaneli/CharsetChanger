"use strict";
/**
 * MODULE STATIC EXPORTS
 */
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
/**
 * MODULE CORE
 */
var Charset;
(function (Charset) {
    Charset["UCS2"] = "ucs2";
    Charset["UTF7"] = "utf-7";
    Charset["UTF7_IMAP"] = "utf-7-imap";
    Charset["UTF8"] = "utf8";
    Charset["UTF16"] = "utf16";
    Charset["UTF16_LE"] = "utf16-le";
    Charset["UTF16_BE"] = "utf16-le";
    Charset["UTF32"] = "utf32";
    Charset["UTF32_LE"] = "utf32-le";
    Charset["UTF32_BE"] = "utf32-le";
    Charset["ASCII"] = "ascii";
    Charset["BINARY"] = "binary";
    Charset["BASE64"] = "base64";
    Charset["HEX"] = "hex";
    Charset["WIN1252"] = "cp1252";
    Charset["CP1252"] = "cp1252";
    Charset["ISO8859_1"] = "iso8859-1";
    Charset["LATIN1"] = "iso8859-1";
})(Charset = exports.Charset || (exports.Charset = {}));
(function (charsetChanger) {
    const fs = require('fs');
    const { glob } = require('glob');
    const iconv = require('iconv-lite');
    class Class {
        rootPath(relativePath) {
            return this._root + relativePath;
        }
        createBackup(path) {
            if (this._createBackup) {
                path = this.rootPath(path);
                fs.copyFileSync(path, path + this.backupSuffix);
            }
        }
        getDecodedData(path, from) {
            return iconv.decode(fs.readFileSync(this.rootPath(path)), from);
        }
        setEncodedData(path, data, to) {
            fs.writeFileSync(this.rootPath(path), iconv.encode(data, to));
        }
        listFiles() {
            try {
                let pathArr = glob.sync(this._search, {
                    cwd: this._root, ignore: this._ignore, cache: 'FILE'
                });
                if (not(this._onList(pathArr))) {
                    throw ListenerException('onList');
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
                let data = this.getDecodedData(path, this._from);
                if (not(this._onBeforeConvert(path, data, index, pathArr))) {
                    throw ListenerException('onBeforeConvert');
                }
                this.createBackup(path);
                this.setEncodedData(path, data, this._to);
                if (not(this._onAfterConvert(path, data, index, pathArr))) {
                    throw ListenerException('onAfterConvert');
                }
            }
            catch (err) {
                debug('error', err, true);
            }
        }
        startConvert() {
            let pathArr = this.listFiles();
            let status = !!tryExecute(() => pathArr.forEach((f, i, arr) => this.changeCharset(f, i, arr)));
            this._onFinish(status);
            return status;
        }
        convert() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.startConvert();
            });
        }
        convertSync() {
            return this.startConvert();
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
            if (!iconv.encodingExists(from)) {
                throw `Encoding ${from} is not supported!`;
            }
            this._from = from;
            return this;
        }
        to(to) {
            if (to === void 0) {
                return this._to;
            }
            if (!iconv.encodingExists(to)) {
                throw `Encoding ${to} is not supported!`;
            }
            this._to = to;
            return this;
        }
        backup(BSOrCB, createBackup) {
            if (BSOrCB === void 0 && createBackup === void 0) {
                return this.backupSuffix;
            }
            if (typeof BSOrCB === 'boolean') {
                return this.backup(void 0, BSOrCB);
            }
            this._createBackup = createBackup !== void 0 ? createBackup : true;
            this.backupSuffix = BSOrCB !== void 0 ? BSOrCB : Class.DEFAULT_BACKUP_SUFFIX;
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
                .backup(config.backupSuffix, config.createBackup || !!config.backupSuffix)
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
    function ListenerException(listenerName) {
        return `Aborted by ${listenerName} listener.`;
    }
    function not(value) {
        return value === false;
    }
    function debug(debugType, message, throwErr) {
        if (debugType === 'none') {
            return;
        }
        if (throwErr && debugType === 'error') {
            throw `[CharsetChanger] ${message}`;
        }
        console[debugType]('[CharsetChanger]', message);
    }
    function tryExecute(tryFn, throwErr) {
        try {
            return tryFn() || true;
        }
        catch (err) {
            return debug('error', err, throwErr) && false;
        }
    }
})(charsetChanger = exports.charsetChanger || (exports.charsetChanger = {}));
exports.Class = charsetChanger.Class;
exports.CharsetChanger = exports.Class;
