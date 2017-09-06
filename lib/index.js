const Loader = require('./error');
const Creator = require('./error/creator');
const GnatError = require('./error/error');

module.exports = function (offset, size, name, bindStack) {
    const loader = new Loader(offset, size, name, bindStack);
    const r = {
        load () {
            loader.load.apply(loader, arguments);
            r.load = function () {
                throw new Error('This loader is initialized.');
            };
        },
        create: loader.create.bind(loader)
    };
    return r;
};

Object.assign(exports, {
    GnatError,
    Loader,
    Creator
});
