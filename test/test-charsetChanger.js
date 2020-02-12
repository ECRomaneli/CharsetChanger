const assert = require('assert');
const { charsetChangerSync } = require('../dist/module/charsetChanger');

assert.doesNotThrow(() => {
    charsetChangerSync({
        root: 'test/output/',
        search: '**/iso*',
        from: 'latin1',
        to: 'utf8',
        backup: true,
        onList: (fileArr) => {
            console.log(fileArr);
        },
        onBeforeConvert: (file) => {
            console.log(file);
            return true;
        }
    });
    // charsetChangerSync({
    //     rootPath: 'test/output/',
    //     search: '**/utf*',
    //     from: 'utf8',
    //     to: 'latin1',
    //     backup: true,
    //     onList: (fileArr) => {
    //         console.log(fileArr);
    //         return fileArr;
    //     }
    // });
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