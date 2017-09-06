const Loader = require('../../lib/error/loader');
const Creator = require('../../lib/error/creator');
const {lorem, random} = require('faker');
const _ = require('lodash');
const expect = require('chai').expect;

module.exports = function () {
    describe('Loader', function () {
        let loader;
        let usedWords = [];
        const getTag = () => {
            let exists = usedWords;
            if (loader) {
                exists = usedWords.concat(Object.keys(loader.instances || {}));
            }
            let str;
            do {
                str = random.word();
            } while (exists.includes(str));
            usedWords.push(str);
            return str;
        };
        const getData = (index) => {
            const fn = () => ({
                index,
                tag: getTag(),
                message: random.words()
            });
            return fn();
        };
        const getDataArr = () => {
            const len = random.number({min: 1, max: 7});
            const arr = _.fill(new Array(len), 0);
            return arr.map((e, i) => getData(i));
        };
        beforeEach(function () {
            usedWords = [];
            const list = Creator.getCreatorList();
            list.splice(0, list.length);
            loader = new Loader(
                random.number({min: 0}),
                Math.pow(10, random.number({min: 1, max: 4})),
                getTag(),
                random.boolean()
            );
            loader.load(getDataArr());
        });
        /* eslint no-template-curly-in-string: off */
        const message = '${name} is a ${attr} ${sex}';
        const getInstanceWithMsgTemp = () => Object.assign(getData(loader.maxIndex + 1), {message});

        describe('.getMessage()', function () {
            it('should get a string from the `message` function.', function () {
                const sentence = lorem.words();
                const words = sentence.split(' ');
                const msg = args => args.join(' ');
                expect(Loader.getMessage(msg, words)).to.equal(sentence);
            });
            describe('should cover all params in a message template', function () {
                it('with array argument.', function () {
                    const instance = getInstanceWithMsgTemp();
                    Loader.compileMessage(instance);
                    const msg = Loader.getMessage(instance.message, ['Sam', 'good', 'boy']);
                    expect(msg).to.equal('Sam is a good boy');
                });
                it('with object argument.', function () {
                    const instance = getInstanceWithMsgTemp();
                    Loader.compileMessage(instance);
                    const msg = Loader.getMessage(instance.message, {
                        name: 'Sam',
                        attr: 'good',
                        sex: 'boy'
                    });
                    expect(msg).to.equal('Sam is a good boy');
                });
            });
            describe('should throw a `new ReferenceError()` if one or more param is not covered.', function () {
                it('with array argument.', function () {
                    const instance = getInstanceWithMsgTemp();
                    Loader.compileMessage(instance);
                    expect(
                        () => Loader.getMessage(instance.message, ['Sam', 'good'])
                    ).to.throw(ReferenceError);
                });
                it('with object argument.', function () {
                    const instance = getInstanceWithMsgTemp();
                    Loader.compileMessage(instance);
                    const name = 'Sam';
                    const attr = 'good';
                    const sex = 'boy';
                    const prop = random.arrayElement(['name', 'attr', 'sex']);
                    const params = {name, attr, sex};
                    delete params[prop];
                    expect(
                        () => Loader.getMessage(instance.message, params)
                    ).to.throw(ReferenceError);
                });
                it('no any param is been covered.', function () {
                    const instance = getInstanceWithMsgTemp();
                    Loader.compileMessage(instance);
                    expect(
                        () => Loader.getMessage(instance.message)
                    ).to.throw(ReferenceError);
                });
            });
            it('should get the non-function `message` itself.', function () {
                const sentence = lorem.words();
                expect(Loader.getMessage(sentence)).to.equal(sentence);
            });
        });

        describe('.compileMessage()', function () {
            it('should do nothing if `message` property is falsy.', function () {
                const instance = getData(loader.maxIndex + 1);
                instance.message = null;
                Loader.compileMessage(instance);
                expect(instance.message).to.be.null;
            });
            it('should do nothing on `message` method of a instance.', function () {
                const instance = getData(loader.maxIndex + 1);
                instance.message = () => {};
                Loader.compileMessage(instance);
                expect(instance.message).to.be.a('function');
            });
            it('should do nothing on `message` property not match /\\$\\{([^}]+)\\}/g of a instance.', function () {
                const sentence = lorem.words();
                const instance = getData(loader.maxIndex + 1);
                instance.message = sentence;
                Loader.compileMessage(instance);
                expect(instance).to.have.property('message', sentence);
            });
            it('should compile `message` property match /\\$\\{([^}]+)\\}/g to a method.', function () {
                const instance = getInstanceWithMsgTemp();
                Loader.compileMessage(instance);
                expect(instance.message).to.be.a('function');
            });
        });

        describe('#addInstance()', function () {
            it('should add a js object', function () {
                const i = (loader.maxIndex || 0) + 1;
                const data = getData(i);
                loader.addInstance(data);
                expect(loader.instances[i]).to.equal(data);
                expect(loader.instances[data.tag]).to.equal(data);
            });
            it('should not add a js object which index is in use.', function () {
                const indexes = Object.keys(loader.instances).filter(n => /^\d+$/.test(n));
                const i = random.arrayElement(indexes);
                const data = getData(parseInt(i, 10));
                const err = `Index ${i} is in use, please assign another index.`;
                expect(() => loader.addInstance(data)).to.throw(err);
            });
            it('should not add a js object which tag is in use.', function () {
                const indexes = Object.keys(loader.instances).filter(n => !/^\d+$/.test(n));
                const tag = random.arrayElement(indexes);
                const data = getData(loader.maxIndex + 1);
                data.tag = tag;
                const err = `Tag ${tag} is in use, please assign another tag.`;
                expect(() => loader.addInstance(data)).to.throw(err);
            });
        });

        describe('#getInstance()', function () {
            it('should get instance by a recorded tag', function () {
                const tags = Object.keys(loader.instances).filter(n => !/^\d+$/.test(n));
                const tag = random.arrayElement(tags);
                const ins = loader.getInstance(tag);
                expect(ins).to.have.a.property('tag', tag);
            });
            it('should get instance by a recorded index', function () {
                const indexes = Object.keys(loader.instances).filter(n => /^\d+$/.test(n));
                const index = parseInt(random.arrayElement(indexes), 10);
                const ins = loader.getInstance(index);
                expect(ins).to.have.a.property('index', index);
            });
            it('should get instance by a recorded error code', function () {
                const indexes = Object.keys(loader.instances).filter(n => /^\d+$/.test(n));
                const index = parseInt(random.arrayElement(indexes), 10);
                const ins = loader.getInstance(loader.range[0] + index);
                expect(ins).to.have.a.property('index', index);
            });
            it('should throw a `new ReferenceError()` if instance is not found.', function () {
                const index = loader.maxIndex + 1;
                expect(() => loader.getInstance(index)).to.throw(ReferenceError);
            });
        });

        it('#create()', function () {
            const tags = Object.keys(loader.instances).filter(n => !/^\d+$/.test(n));
            const tag = random.arrayElement(tags);
            const instance = loader.instances[tag];
            const details = {key: {embedKey: 'val'}};
            const error = loader.create(tag, {details}).toJSON();
            expect(_.pick(error, 'errorCode', 'details'))
                .to.deep.equal({
                    errorCode: loader.range[0] + instance.index,
                    details
                });
            expect(error.name).to.match(new RegExp(`\\.${tag}`));
            expect(error.message).to.be.a('string');
            if (loader.bindStack) {
                expect(error.stack).to.be.a('string');
            } else {
                expect(error).to.not.have.property('bindStack');
            }
        });
    });
};
