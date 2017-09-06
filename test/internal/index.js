const GnatError = require('./gnat-error');
const Creator = require('./creator');
const Loader = require('./loader');

module.exports = function () {
    describe('internal modules', function () {
        GnatError();
        Creator();
        Loader();
    });
};
