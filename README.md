<p align='center'>
    <img src="https://i.postimg.cc/q7Ln0qrn/logo.png" alt='logo' />
</p>
<p align='center'>
    Change the charset for an entire folder recursively
</p>
<p align='center'>
    <a href='https://www.npmjs.com/package/charset-changer'><img alt='npm version' src='https://img.shields.io/npm/v/charset-changer.svg'/></a>
    <a href='https://github.com/ECRomaneli/CharsetChanger/blob/master/LICENSE'><img alt='mit license' src='https://img.shields.io/badge/license-MIT-blue.svg'/></a>
    <a href='https://github.com/ECRomaneli/CharsetChanger'><img alt='contributions welcome' src='https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat'/></a>
</p>

## Objective

The objective of this library is help to solve some charset issues in projects with many workers. For this purpose, this library helps to convert all necessary files to the correct charset.

## Install

```npm
npm i charset-changer
```

## Getting Started

### Static

**Importing the static instance**<p/>
To use charset-changer directly, import script with this code:

```typescript
const { charsetChanger } = require('charset-changer')
```

if you want to use sync (file-by-file) convertion, use:

```typescript
const { charsetChangerSync } = require('charset-changer')
```

If async call are used, the `onFinish` status always will be `true` and you will not be able to cancel conversion with `onAfterConvert`.

### Using

The `charsetChanger` have only one argument, the `CharsetChanger.Config`. Use it to configure the library the way you want. This call will configure and convert the files automaticaly.

### CharsetChanger.Config
```typescript
    {
        root: string, // root path.
        search?: GlobString, // glob string (see on "How it works" section).
        ignore?: GlobString, // glob string.
        from?: Charset|string, // From charset. Default: Charset Detector.
        to: Charset|string, // To charset.
        createBackup?: boolean, // create backup? Default is false.
        backupSuffix?: string, // backup suffix. Default is ".bkp".
        onList?: OnList, // On get list of files listener.
        onBeforeConvert?: OnBeforeConvert, // On before convert listener.
        onAfterConvert?: OnAfterConvert, // On after convert listener.
        onFinish?: OnFinish, // On finish listener.
        debug?: boolean, // Show messages.
        detectorFilter?: DetectorFilter // Filter files by charset detection.
    }
```

See the [example here](#async-static-method).

### Class

### Importing the class

To use charset-changer, import script with this code:

```typescript
const { CharsetChanger } = require('charset-changer') // Uppercase 'C'
/* OR */
const CharsetChanger = require('charset-changer').Class
```

### Methods

Instantiate the class and configure the instance using the `accessors` of the object:

```typescript
public root(): FilePath;
public root(root: FilePath): this;

public search(): GlobString;
public search(search: GlobString): this;

public ignore(): GlobString;
public ignore(ignore: GlobString): this;

public from(): Charset;
public from(from: Charset): this;

public to(): Charset;
public to(to: Charset): this;

public debug(): boolean;
public debug(debug: boolean): this;

public backup(): string;
public backup(backupSuffix: string): this;
public backup(createBackup: boolean): this;
public backup(backupSuffix: string, createBackup: boolean): this;

public onList(onList: OnList): this;
public onBeforeConvert(onBeforeConvert: OnBeforeConvert): this;
public onAfterConvert(onAfterConvert: OnAfterConvert): this;
public onFinish(onFinish: OnFinish): this;
public setDetectorFilter(detectorFilter: DetectorFilter): this;

public setConfig(config: CharsetChanger.Config): this;
```

To convert you folder (or project) use the convertion classes:

```typescript
public convert(): void;
public async convertSync(): Promise<void>; // use await
```

See the [example here](#async-class-method).

## How it works

This lib uses `glob`, `iconv-lite` and `chardet` to automate charset changes into an folder (or project) recursively.

With the `glob` features, you gonna use an complex search string to get filtered files into the root path.

### Glob string example

- **\*.\*** - All files into the root path;
- **\*.txt** - All `.txt` files into the root path;
- **\*\*/\*** - All files **(recursively)** into the root path;
- **\*\*/\*.txt** - All `.txt` files **(recursively)** into the root path.

The `iconv-lite` is responsible to the charset decode and encode, so every charset supported by iconv is supported by CharsetChanger. (See the [supported encodings here](https://github.com/ashtuchkin/iconv-lite#supported-encodings) [pay attention to the version used]).

The CharsetChanger has an enum with the principal charsets supported **but not limited to that**. The `Charset` enum is disponible into the module.

To use the `Charset` enum import using:

```typescript
const { Charset } = require('charset-changer')
```

## Usage Examples

### Async static method

```typescript
const { charsetChangerSync, charsetChanger, Charset } = require('charsetChanger');

charsetChanger({
    root: 'test/output', // Root path
    search: '**/example*.txt', // Glob string
    from: Charset.UTF8, // from utf-8
    to: Charset.ISO8859_1, // to iso8859-1
    createBackup: true,
    backupSuffix: '.backup',
    onFinish: () => { console.log("utf8 to iso8859-1"); }
});
```

### Async Class Method

```typescript
const { CharsetChanger, Charset } = require('charsetChanger');

let charsetChanger = new CharsetChanger();

/* ---------------------- */

charsetChanger
    .root('test/output')
    .search('**/example*.txt')
    .from(Charset.UTF8 /* OR */ 'utf8')
    .to(Charset.ISO8859_1 /* OR */ 'iso8859-1')
    .backup('.backup'       // OR
            '.backup', true // OR JUST 
            true)           // DEFAULT SUFFIX IS .bkp
    .onFinish(() => { console.log("utf8 to iso8859-1"); })
    .convert(); // <====== CONVERTING

/* OR */

charsetChanger.setConfig({
    root: 'test/output', // Root path
    search: '**/example*.txt', // Glob string
    from: Charset.UTF8, // from utf-8
    to: Charset.ISO8859_1, // to iso8859-1
    createBackup: true,
    backupSuffix: '.backup',
    onFinish: () => { console.log("utf8 to iso8859-1"); }
}).convert(); // <====== CONVERTING

/* ---------------------- */
```

See more usages into the [test folder](https://github.com/ECRomaneli/CharsetChanger/blob/master/test).

## See more

- Create an `electron` app to convert entire projects [separate project].

## Author

- Created and maintained by [Emerson C. Romaneli](https://github.com/ECRomaneli) (@ECRomaneli).

## License

[MIT License](https://github.com/ECRomaneli/CharsetChanger/blob/master/LICENSE)