const assert = require('assert');
const { charsetChangerSync, charsetChanger } = require('../dist/module/charsetChanger');

assert.doesNotThrow(() => {
    charsetChangerSync({
        root: 'test/output',
        search: 'latin1.txt',
        from: 'latin1',
        to: 'utf8',
        createBackup: true,
        backupSuffix: '.backup',
        onFinish: () => { console.log("latin1 to utf8"); }
    });
    charsetChangerSync({
        root: 'test/output',
        search: 'latin1.txt',
        from: 'utf8',
        to: 'latin1',
        onFinish: () => { console.log("utf8 to latin1"); }
    });
}, 'Static changer');

// assert.doesNotThrow(() => {
//     let cc = new charsetChanger.Class();

//     cc.setConfig({
//         rootPath: 'output/',
//         search: 'iso88591*',
//         from: 'iso88591',
//         to: 'utf8',
//         backup: true
//     });
//     cc.convert();

//     cc.search('utf8*');
//     cc.from('iso88591');
//     cc.to('utf8');
//     cc.convert();
// }, 'Class changer');