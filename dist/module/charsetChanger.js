"use strict";
/**
 * MODULE STATIC EXPORTS
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Change charset.
 * @param config Used to config the CharsetChanger before convert.
 */
function charsetChanger(config) {
    return charsetChanger.instance.setConfig(config).convert();
}
exports.charsetChanger = charsetChanger;
/**
 * Change charset sync.
 * @param config Used to config the CharsetChanger before convert.
 */
function charsetChangerSync(config) {
    charsetChanger.instance.setConfig(config).convertSync();
}
exports.charsetChangerSync = charsetChangerSync;
/**
 * MODULE CORE
 */
var Charset;
(function (Charset) {
    Charset["UCS2"] = "ucs2";
    Charset["UTF7"] = "UTF-7";
    Charset["UTF7_IMAP"] = "UTF-7-IMAP";
    Charset["UTF16"] = "UTF16";
    Charset["UTF32"] = "UTF32";
    Charset["ASCII"] = "ascii";
    Charset["BINARY"] = "binary";
    Charset["BASE64"] = "base64";
    Charset["HEX"] = "hex";
    Charset["WIN1252"] = "windows-1252";
    Charset["CP1252"] = "windows-1252";
    Charset["LATIN1"] = "ISO-8859-1";
    // CHARDET
    Charset["UTF8"] = "UTF-8";
    Charset["UTF16_LE"] = "UTF-16 LE";
    Charset["UTF16_BE"] = "UTF-16 BE";
    Charset["UTF32_LE"] = "UTF-32 LE";
    Charset["UTF32_BE"] = "UTF-32 BE";
    Charset["ISO2022_JP"] = "ISO-2022-JP";
    Charset["ISO2022_KR"] = "ISO-2022-KR";
    Charset["ISO2022_CN"] = "ISO-2022-CN";
    Charset["SHIFT_JIS"] = "Shift-JIS";
    Charset["BIG5"] = "Big5";
    Charset["EUC_JP"] = "EUC-JP";
    Charset["EUC_KR"] = "EUC-KR";
    Charset["GB18030"] = "GB18030";
    Charset["ISO8859_1"] = "ISO-8859-1";
    Charset["ISO8859_2"] = "ISO-8859-2";
    Charset["ISO8859_5"] = "ISO-8859-5";
    Charset["ISO8859_6"] = "ISO-8859-6";
    Charset["ISO8859_7"] = "ISO-8859-7";
    Charset["ISO8859_8"] = "ISO-8859-8";
    Charset["ISO8859_9"] = "ISO-8859-9";
    Charset["WINDOWS_1250"] = "windows-1250";
    Charset["WINDOWS_1251"] = "windows-1251";
    Charset["WINDOWS_1252"] = "windows-1252";
    Charset["WINDOWS_1253"] = "windows-1253";
    Charset["WINDOWS_1254"] = "windows-1254";
    Charset["WINDOWS_1255"] = "windows-1255";
    Charset["WINDOWS_1256"] = "windows-1256";
    Charset["KOI8_R"] = "KOI8-R";
})(Charset = exports.Charset || (exports.Charset = {}));
(function (charsetChanger) {
    const fs = require('fs');
    const { glob } = require('glob');
    const chardet = require('chardet');
    const iconv = require('iconv-lite');
    const DEFAULT_BACKUP_SUFFIX = '.bkp';
    const DEFAULT_LISTENER = () => { };
    const MAX_SAMPLE_SIZE = 200000;
    class Class {
        constructor() {
            this.Debug = {
                log: (message) => this._debug && debug('log', message),
                info: (message) => this._debug && debug('info', message),
                warn: (message) => this._debug && debug('warn', message),
                err: (message, throwErr) => this._debug && debug('error', message, throwErr !== false)
            };
            this._messageList = [];
        }
        tryConvert(tryFn) {
            try {
                tryFn();
                this._onFinish(true, this._messageList);
            }
            catch (err) {
                this._onFinish(false, this._messageList);
                this.Debug.err(err);
            }
        }
        addMessage(file, message, throwErr) {
            this.Debug.info(message);
            this._messageList.push({ file, message });
            if (throwErr) {
                throw message;
            }
        }
        rootPath(relativePath) {
            return this._root + relativePath;
        }
        detectCharset(path, buffer) {
            let charset = chardet.detect(buffer, { sampleSize: MAX_SAMPLE_SIZE });
            if (!iconv.encodingExists(charset)) {
                this.addMessage(path, EncodingNotSupportedMessage(charset));
            }
            else if (charset === this._to) {
                this.addMessage(path, SkippingConversionMessage(path, `The file is already ${charset}`));
            }
            else if (not(this._detectorFilter(path, charset))) {
                this.addMessage(path, SkippingConversionMessage(path, `Charset detected: ${charset}`));
            }
            else {
                return charset;
            }
            return null;
        }
        getDecodedData(path) {
            this.Debug.log('Getting decoded data...');
            let fileBuffer = fs.readFileSync(this.rootPath(path));
            let from = this._from || this.detectCharset(path, fileBuffer);
            this.Debug.info(`Charset: ${from};`);
            return from ? iconv.decode(fs.readFileSync(this.rootPath(path)), from) : null;
        }
        setEncodedData(path, data) {
            this.Debug.log('Setting encoded data...');
            this.Debug.info(`Charset: ${this._to};`);
            fs.writeFileSync(this.rootPath(path), iconv.encode(data, this._to));
        }
        createBackup(path) {
            if (this._createBackup) {
                this.Debug.log('Creating backup...');
                this.Debug.info(`Backup suffix: ${this.backupSuffix}`);
                path = this.rootPath(path);
                fs.copyFileSync(path, path + this.backupSuffix);
            }
        }
        listFiles() {
            this.Debug.log('Listing files...');
            let pathArr = glob.sync(this._search, {
                cwd: this._root, ignore: this._ignore, nodir: true
            });
            this.Debug.info(pathArr);
            if (not(this._onList(pathArr))) {
                this.addMessage(null, ListenerMessage('onList'), true);
            }
            return pathArr;
        }
        changeCharset(path, index, pathArr) {
            let data = this.getDecodedData(path);
            if (data === null) {
                return;
            }
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
        startConvert() {
            this.tryConvert(() => {
                this.Debug.log('Try converting...');
                this.listFiles().forEach((f, i, arr) => this.changeCharset(f, i, arr));
                this.Debug.log('Finished.');
            });
        }
        convert() {
            return new Promise((resolve) => resolve(this.startConvert()));
        }
        convertSync() {
            this.startConvert();
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
            if (from !== null && !iconv.encodingExists(from)) {
                throw EncodingNotSupportedMessage(from);
            }
            this._from = from;
            return this;
        }
        to(to) {
            if (to === void 0) {
                return this._to;
            }
            if (!iconv.encodingExists(to)) {
                throw EncodingNotSupportedMessage(to);
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
            this.backupSuffix = BSOrCB !== void 0 ? BSOrCB : DEFAULT_BACKUP_SUFFIX;
            return this;
        }
        debug(debug) {
            if (debug === void 0) {
                return this._debug;
            }
            this._debug = debug;
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
        detectorFilter(detectorFilter) {
            this._detectorFilter = detectorFilter;
            return this;
        }
        setConfig(config) {
            return this
                .root(config.root || null)
                .search(config.search || '**/*')
                .ignore(config.ignore || null)
                .from(config.from || null)
                .to(config.to || null)
                .backup(config.backupSuffix, config.createBackup || !!config.backupSuffix)
                .onList(config.onList || DEFAULT_LISTENER)
                .onBeforeConvert(config.onBeforeConvert || DEFAULT_LISTENER)
                .onAfterConvert(config.onAfterConvert || DEFAULT_LISTENER)
                .onFinish(config.onFinish || DEFAULT_LISTENER)
                .detectorFilter(config.detectorFilter || DEFAULT_LISTENER)
                .debug(config.debug || false);
        }
    }
    charsetChanger.Class = Class;
    charsetChanger.instance = new Class();
    const SkippingConversionMessage = (p, m) => `Skipping "${p}" conversion. ${m}.`;
    const ListenerMessage = (lName) => `The ${lName} listener returned false.`;
    const EncodingNotSupportedMessage = (c) => `Encoding ${c} is not supported!`;
    const not = (value) => value === false;
    function debug(debugType, message, throwErr) {
        if (throwErr && debugType === 'error') {
            throw `[CharsetChanger] ${message}`;
        }
        console[debugType](`[CharsetChanger] ${debugType.toUpperCase()} `, message);
    }
})(charsetChanger = exports.charsetChanger || (exports.charsetChanger = {}));
exports.Class = charsetChanger.Class;
exports.CharsetChanger = exports.Class;
//# sourceMappingURL=charsetChanger.js.map