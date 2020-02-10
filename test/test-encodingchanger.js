const assert = require('assert');

assert.doesNotThrow(() => {
    throw "Working..."
}, '');