const assert = require('assert');
const { charsetChangerSync, charsetChanger, Charset } = require('../');

let fileList = [],
    defaults = {
        root: 'test',
        to: Charset.CP1252,
        debug: !true
    };

assert.doesNotThrow(() => {
    let syncCall;
    charsetChanger({
        root: defaults.root,
        to: defaults.to,
        debug: defaults.debug,
        detectorFilter: (path) => {
            fileList.push(path);
            return false;
        },
    }).finally(() => {
       if (!syncCall) { throw 'Async Test Error.'; }
    });
    syncCall = true;
}, 'Async Test');

assert.doesNotThrow(() => {
    let i = 0;
    charsetChangerSync({
        root: defaults.root,
        to: defaults.to,
        debug: defaults.debug,
        detectorFilter: (path) => {
            if (fileList[i++] !== path) { throw 'Sync Test Error.'; }
            return false;
        },
    });
}, 'Sync Test');

assert.equal((() => {
    let i = 0, inc = () => { i++ };
    charsetChangerSync({
        root: defaults.root,
        to: defaults.to,
        debug: defaults.debug,
        onList: inc,
        onFinish: inc
    });
    return i;
})(), 2, 'Listener Count');
