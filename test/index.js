const MainModule = require('../lib');
const internal = require('./internal');
const Loader = require('../lib/error/loader');
const Creator = require('../lib/error/creator');
const {random} = require('faker');
const _ = require('lodash');
const expect = require('chai').expect;

internal();

describe('MainModule', function () {
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
        const {loadersList} = Loader;
        loadersList.splice(0, loadersList.length);
        loader = MainModule(
            random.number({min: 0}),
            Math.pow(10, random.number({min: 1, max: 4})),
            getTag(),
            random.boolean()
        );
    });

    it('should throw a `new RangeError()` when the error code space conflict.', function () {
        const [offset, max] = Loader.loadersList[0].range;
        const size = max - offset;
        expect(
            () => MainModule(offset, size, getTag())
        ).to.throw(RangeError);
    });

    describe('.load()', function () {
        it('should load error instance configs.', function () {
            const arr = getDataArr();
            loader.load(arr);
            const rawLoader = Loader.loadersList[0];
            const instances = _.uniq(_.values(rawLoader.instances));
            expect(instances).to.have.deep.members(arr);
        });
        it('should load only one time', function () {
            const arr = getDataArr();
            loader.load(arr);
            expect(() => loader.load(arr)).to.throw('This loader is initialized.');
        });
    });

    it('.create()', function () {
        const rawLoader = Loader.loadersList[0];
        loader.load(getDataArr());
        const tags = Object.keys(rawLoader.instances).filter(n => !/^\d+$/.test(n));
        const tag = random.arrayElement(tags);
        const instance = rawLoader.instances[tag];
        const details = {key: {embedKey: 'val'}};
        const error = loader.create(tag, {details}).toJSON();
        expect(_.pick(error, 'errorCode', 'details'))
            .to.deep.equal({
                errorCode: rawLoader.range[0] + instance.index,
                details
            });
        expect(error.name).to.match(new RegExp(`\\.${tag}`));
        expect(error.message).to.be.a('string');
        if (rawLoader.bindStack) {
            expect(error.stack).to.be.a('string');
        } else {
            expect(error).to.not.have.property('bindStack');
        }
    });
});
