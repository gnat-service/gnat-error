const Creator = require('../../lib/error/creator');
const GnatError = require('../../lib/error/error');
const {lorem, random} = require('faker');
const expect = require('chai').expect;

module.exports = function () {
    describe('Creator', function () {
        const getNumFromRange = (min, max) => random.number({min, max});
        const getExponent = getNumFromRange.bind(null, 2, 4);
        const getOffset = (exponent, rate) => Math.pow(10, exponent) * (rate || getNumFromRange(1, 9));
        const getSize = exponent => Math.pow(10, exponent - 1);
        const getParams = () => {
            const exponent = getExponent();
            return {
                offset: getOffset(exponent),
                size: getSize(exponent)
            };
        };

        const getMaxFromMin = (min, size) => min + size - 1;
        const getMinFromMax = (max, size) => max - size + 1;
        const getSizeFromRange = (max, min) => max - min + 1;

        const getRange = (min, max) => {
            if (!min && !max) {
                const {offset, size} = getParams();
                return [offset, getMaxFromMin(offset, size)];
            }
            if (min > max) {
                return [max, min];
            }
            const exponent = getExponent();
            if (min) {
                max = max || getMaxFromMin(min, getSize(exponent));
            } else if (max) {
                min = min || getMinFromMax(max, getSize(exponent));
            }
            if (min > max) {
                return [max, min];
            }
            return [min, max];
        };

        const getCreatorFromRange = ([offset, max], fake) => {
            const size = getSizeFromRange(max, offset);
            if (fake) {
                return {offset, size, name: lorem.word(), bindStack: random.boolean()};
            }
            return new Creator(offset, size, lorem.word(), random.boolean());
        };

        const rangeStringify = ([min, max]) => `[${min}, ${max}]`;
        const getBetween = ([min, max]) => random.number({min, max});
        const getLeft = ([min]) => random.number({max: min - 1});
        const getRight = ([, max]) => random.number({min: max + 1});
        const getLeftRange = range => getRange(null, getLeft(range));
        const getRightRange = range => getRange(getRight(range));
        const getBetweenRange = range => getRange(getBetween(range), getBetween(range));
        const getLeftBetweenRange = range => getRange(getBetween(range), getRight(range));
        const getRightBetweenRange = range => getRange(getLeft(range), getBetween(range));
        const getLeftRightRange = range => getRange(getLeft(range), getRight(range));
        const getIsolatedRange = range => random.arrayElement([
            getLeftRange,
            getRightRange
        ])(range);
        const getIntersectedRange = range => random.arrayElement([
            getBetweenRange,
            getLeftBetweenRange,
            getRightBetweenRange,
            getLeftRightRange
        ])(range);

        const testRange = [1, 2];
        // getLeft();
        let index = 0;
        let el = testRange[index];
        if (random.number({max: el - 1, min: el - 1}) >= el) {
            throw new Error(`getLeft() is not work well.`);
        }
        // getRight();
        index = 1;
        el = testRange[index];
        if (random.number({min: el + 1, max: el + 1}) <= el) {
            throw new Error(`getRight() is not work well.`);
        }

        let _range;
        let creator;
        beforeEach(function () {
            const list = Creator.getCreatorList();
            list && list.length && list.splice(0, list.length);
            _range = getRange();
            creator = getCreatorFromRange(_range);
        });

        it('.range()', function () {
            expect(Creator.range(creator)).to.deep.equal(_range);
        });

        describe('.between()', function () {
            const range = getRange();
            const [min, max] = range;
            const left = getLeft(range);
            const between = getBetween(range);
            const right = getRight(range);
            const title = (num, isBetween) => `${num} is ${isBetween ? '' : 'not '}between ${min} and ${max}.`;
            it(title(left), function () {
                expect(Creator.between(left, range)).to.equal(false);
            });

            it(title(right), function () {
                expect(Creator.between(right, range)).to.equal(false);
            });

            it(title(between, true), function () {
                expect(Creator.between(between, range)).to.equal(true);
            });
        });

        describe('.intersect()', function () {
            const rangeA = getRange();
            const left1 = getLeft(rangeA);
            const left2 = getLeft([left1]);
            const right1 = getRight(rangeA);
            const right2 = getRight([null, right1]);
            const between1 = getBetween(rangeA);
            const between2 = random.boolean() ? getBetween([between1, rangeA[1]]) : getBetween([rangeA[0], between1]);
            const title = (rangeB, isIntersected, position) => {
                let ranges = [rangeA, rangeB];
                if (position === 'left') {
                    ranges = [rangeB, rangeA];
                }

                return `${ranges.map(rangeStringify).join(' and ')} ${isIntersected ? '' : 'not '}intersect.`;
            };
            const lefts = getRange(left1, left2);
            const rights = getRange(right1, right2);
            const betweens = getRange(between1, between2);

            [
                {range: lefts, intersected: false, position: 'left'},
                {
                    range: [random.arrayElement(lefts), random.arrayElement(betweens)],
                    intersected: true,
                    position: 'left'
                },
                {range: betweens, intersected: true},
                {range: [left1, right1], intersected: true},
                {
                    range: [random.arrayElement(betweens), random.arrayElement(rights)],
                    intersected: true,
                    position: 'right'
                },
                {range: rights, intersected: false, position: 'right'},
            ].forEach(({range, intersected, position}) =>
                it(title(range, intersected, position), function () {
                    expect(Creator.intersect(rangeA, range)).to.equal(intersected);
                })
            );
        });

        describe('.addCreator()', function () {
            it('a creator created from a isolated range should be added.', function () {
                const range = getIsolatedRange(_range);
                expect(
                    () => Creator.addCreator(getCreatorFromRange(range, true))
                ).to.not.throw();
                expect(Creator.getCreatorList()).to.have.lengthOf(2);
            });

            it('a creator created from a intersected range should not be added.', function () {
                const range = getIntersectedRange(_range);
                expect(
                    () => Creator.addCreator(getCreatorFromRange(range, true))
                ).to.throw(RangeError);
            });
        });

        describe('#getErrorCode()', function () {
            it('should return error code.', function () {
                const min = creator.offset;
                const idx = random.number({min: 0, max: creator.size - 1});
                const code = creator.getErrorCode(idx);
                expect(code).to.equal(min + idx);
            });

            it('pass in `creator.size - 1` should return the max error code.', function () {
                const idx = creator.size - 1;
                expect(creator.getErrorCode(idx)).to.equal(getMaxFromMin(creator.offset, creator.size));
            });

            it('pass in `creator.size` should throw a `new RangeError()`.', function () {
                const idx = creator.size;
                expect(
                    () => creator.getErrorCode(idx)
                ).to.throw(RangeError);
            });

            it(`non-numeric or NaN should be treated as 0`, function () {
                const idx = random.arrayElement([null, undefined, NaN]);
                expect(creator.getErrorCode(idx)).to.equal(creator.offset);
            });

            it(`minus should be treated as 0`, function () {
                const idx = random.arrayElement([-Infinity, random.number({max: -1})]);
                expect(creator.getErrorCode(idx)).to.equal(creator.offset);
            });

            it('pass in a beyond number should throw a `new RangeError()`', function () {
                const idx = random.number({min: creator.size});
                expect(
                    () => creator.getErrorCode(idx)
                ).to.throw(RangeError);
            });
        });

        describe('#create()', function () {
            it('should return a subclass of `GnatError` at 1st time.', function () {
                const Err = creator.create();
                expect(new Err()).to.be.an.instanceof(GnatError.GnatError);
            });
            it('should throw an Error at 2rd time.', function () {
                creator.create();
                expect(() => creator.create()).to.throw('This creator is already initialized.');
            });
        });
    });
};
