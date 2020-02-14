const assert = require('assert');
const { charsetChangerSync, charsetChanger, Charset } = require('../');

assert.doesNotThrow(() => {
    charsetChanger({
        root: 'test',
        to: Charset.UTF8,
        debug: !true,
        detectorFilter: () => false,
        onFinish: ()=> console.log('async')
    });
    console.log('sync');
}, 'Static changer - Example');
