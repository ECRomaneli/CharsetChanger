const assert = require('assert');
const { charsetChangerSync, charsetChanger, Charset } = require('../dist/module/charsetChanger');

assert.doesNotThrow(() => {
    charsetChanger({
        root: 'test/output',
        search: 'example*.txt',
        from: Charset.UTF8,
        to: Charset.ISO8859_1
    }).finally(() => console.log("finally"));
}, 'Static changer - Example');