const GnatError = require('../../lib/error/error');
const {lorem, random} = require('faker');
require('chai').should();

module.exports = function () {
    describe('GnatError', function () {
        describe('new GnatError()', function () {
            it('should have a `message` property.', function () {
                const err = new GnatError();
                err.should.have.property('message').with.lengthOf(0);
            });

            it('should have a `name` property with assigned value.', function () {
                const name = 'SomeError';
                const err = new GnatError('some message', 10000, name);
                err.should.have.property('name', name);
            });

            it('should have a default `name` property, with value "GnatError".', function () {
                const err = new GnatError();
                err.should.have.property('name', 'GnatError');
            });
        });

        describe('#getName()', function () {
            it('should return #name', function () {
                const err = new GnatError('msg', 10000, 'SomeError');
                err.getName().should.be.equal(err.name);
            });
        });

        describe('JSON.stringify(gnatErr)', function () {
            it('should return a brief of GnatError instance.', function () {
                const message = lorem.words();
                const errorCode = random.number({max: 999999, min: 100000});
                const name = lorem.word();
                const bindStack = random.boolean();

                const err = new GnatError(message, errorCode, name, bindStack);
                const json = JSON.parse(JSON.stringify(err));
                const expect = {message, errorCode, name};
                if (bindStack) {
                    expect.stack = err.stack;
                }
                json.should.deep.equal(expect);
            });
        });
    });
};
