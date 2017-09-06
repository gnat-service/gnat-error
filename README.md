# gnat-error

Create your customized, unified error system.

## Getting started

```
$ npm install gnat-error
```

Simply:

```js
const Loader = require('gnat-error');

// initialize a `SomeError` creator.
const offset = 1000000; // You error code offset.
const size = 1000; // How many error tags you want put in.
const name = 'SomeError'; // `SomeError.prototype.name`
const bindStack = true; // If true, a `SomeError` instance can be stringified with a `stack` property.
const SomeErrorCreator = Loader(offset, size, name, bindStack);
const SomeErrorCreator.load([
    {
        index: 0, // min: 0, max: size, cannot be duplicated.
        tag: 'SomeTag', // cannot be duplicated.
        message: 'some message with a ${param}' // a function (should return a string) or a string
    },
    {
        index: n,
        tag: 'SomeTagN',
        message: 'some message'
    }
]);

// create a instance of `SomeError`
const error = new SomeErrorCreator('SomeTag', {details: {key: 'val'}, msgParams: {param: 'parameter'} /* or simply `[parameter]` */});
console.log(JSON.stringify(error)) // {"name":"SomeError","errorCode":1000000,"message":"some message with a parameter","details":{"key":"val"}}
```

## ustomization

Custom `GnatError.prototype.toJSON()`
-------------------------------------

```js
const Loader = require('gnat-error');

const GnatError = Loader.GnatError.GnatError;
GnatError.prototype.toJSON = function () {
    // your code, don't forget return an object.
    // besides, you may get the whole name with `GnatError.prototype.getName()`
};
```

Custom whole GnatError class
----------------------------

```js
const Loader = require('gnat-error');

const GnatError = Loader.GnatError;

class SomeError extends Error {
    constructor (message, code, name, bindStack) {
        // your code
    }
    getName () {
        return this.name;
    }
}

GnatError.setGnatErrorClass(SomeError);
console.log(GnatError.GnatError === SomeError); // true
```
