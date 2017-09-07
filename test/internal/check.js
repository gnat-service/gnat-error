/**
 * Created by leaf4monkey on 09/07/2017
 */
const check = require('../../lib/error/check');
const expect = require('chai').expect;
const {random} = require('faker');

module.exports = () =>
    describe('check', function () {
        describe('.check()', function () {
            const getBasicTypeVal = () =>
                random.arrayElement([
                    random.number(),
                    null,
                    undefined,
                    {},
                    random.word(),
                    () => {}
                ]);
            it('optional mode should accept a null like value.', function () {
                expect(() => check.check(
                    random.arrayElement([null, undefined]),
                    random.arrayElement(['string', 'number', 'boolean', 'function', 'symbol']),
                    true
                )).to.not.throw();
            });
            it('check a basic type value.', function () {
                const value = getBasicTypeVal();
                const type = typeof value;
                expect(() => check.check(value, type)).to.not.throw();
            });
            it('should throw a type error if basic type not match.', function () {
                const value = getBasicTypeVal();
                const type = typeof value;
                const basicTypes = ['undefined', 'object', 'boolean', 'number', 'string', 'function']
                    .filter(n => n !== type);
                expect(() => check.check(value, random.arrayElement(basicTypes))).to.throw(TypeError);
            });
            class A {
            }
            it('check a custom type value.', function () {
                const value = new A();
                expect(() => check.check(value, A)).to.not.throw();
            });
            it('check a custom type value with its super class.', function () {
                const value = new A();
                expect(() => check.check(value, Object)).to.not.throw();
            });
            it('should throw a type error if custom type not match.', function () {
                class B {}
                const value = new B();
                expect(() => check.check(value, A)).to.throw(TypeError);
            });
        });
        describe('.checkNum()', function () {
            it('should do nothing if `num` is a ordinary number.', function () {
                expect(() => check.checkNum(random.number())).to.not.throw();
            });
            it('should throw a `new TypeError()` if `num` is not number in require mode.', function () {
                expect(() => check.checkNum(random.arrayElement(['', null, undefined, {}, []])))
                    .to.throw(TypeError);
            });
            it('should throw a `new TypeError()` by default if `num` is `NaN`.', function () {
                expect(() => check.checkNum(NaN)).to.throw(TypeError);
            });
            it('should throw a `new TypeError()` by default if `num` is Infinity.', function () {
                expect(() => check.checkNum(Infinity)).to.throw(TypeError);
            });
            it('should throw a `new TypeError()` by default if `num` is -Infinity.', function () {
                expect(() => check.checkNum(-Infinity)).to.throw(TypeError);
            });
            it('should accept a `null` like value in optional mode.', function () {
                console.log({NullIsNaN: isNaN(null)})
                console.log({UndefinedIsNaN: isNaN(undefined)})
                expect(() => check.checkNum(random.arrayElement([null, undefined]), {optional: true})).to.not.throw();
            });
            it('should accept `NaN` if `options.acceptNaN` is assigned to `true`', function () {
                expect(() => check.checkNum(NaN, {acceptNaN: true})).to.not.throw();
            });
            it('should accept `Infinity` if `options.acceptInfinity` is assigned to `true`', function () {
                expect(() => check.checkNum(Infinity, {acceptInfinity: true})).to.not.throw();
            });
            it('should accept `-Infinity` if `options.acceptInfinity` is assigned to `true`', function () {
                expect(() => check.checkNum(-Infinity, {acceptInfinity: true})).to.not.throw();
            });
        });
    });
