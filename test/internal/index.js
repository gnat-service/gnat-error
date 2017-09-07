const GnatError = require('./gnat-error');
const Creator = require('./creator');
const Loader = require('./loader');
const check = require('./check');

module.exports = function () {
    describe('internal modules', function () {
        check();
        GnatError();
        Creator();
        Loader();
    });
};
