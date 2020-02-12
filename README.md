<p align='center'>
    <img src="https://i.postimg.cc/q7Ln0qrn/logo.png" alt='logo' />
</p>
<p align='center'>
    Change the charset for an entire folder recursively
<p/>
<p align='center'>
    <img src="https://img.shields.io/npm/v/charset-changer.svg" alt="module version">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license">
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions welcome">
</p>

## Install

```
npm i charset-changer
```

## Using

### Import script
To use charset-changer, import script with this code:

```typescript
const { charsetChanger } = require('charset-changer')
```

if you want to use sync convertion, use:

```typescript
const { charsetChangerSync } = require('charset-changer')
```

## Example

```typescript
    charsetChangerSync({
        root: './', // Root path
        search: '**/latin1.txt', // Glob string
        from: 'latin1', // Node FS pattern for ISO8859-1
        to: 'utf8', // Node FS pattern
        createBackup: true,
        backupSuffix: '.backup',
        onFinish: () => { console.log("latin1 to utf8"); }
    });
```

See [the test folder](https://github.com/ECRomaneli/CharsetChanger/blob/master/test).

## Objectives to first stable version
- Use `iconv` instead of `node-fs` to convert charcodes for more possibilities;
- Do not convert files already in "to" charset;
- Create an `electron` app to convert entire projects [separate project].

## Doc in progress...


## Author

- Created and maintained by [Emerson C. Romaneli](https://github.com/ECRomaneli) (@ECRomaneli).

## License

[MIT License](https://github.com/ECRomaneli/CharsetChanger/blob/master/LICENSE)