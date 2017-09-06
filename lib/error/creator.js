const GnatError = require('./error');

const creatorList = [];
const range = function (creator) {
    return [creator.offset, creator.offset + creator.size - 1];
};
const between = function (number, bounds) {
    return number >= bounds[0] && number <= bounds[1];
};

const intersect = function (bounds, newBounds) {
    let flag = false;
    const fn = function (a, b) {
        a.forEach(function (num) {
            if (between(num, b)) {
                flag = true;
            }
        });
        return flag;
    };
    return fn(bounds, newBounds) || fn(newBounds, bounds);
};

const isConflict = function (creator) {
    creatorList.forEach(function (c) {
        const bounds = range(c);
        const newBounds = range(creator);
        if (intersect(bounds, newBounds)) {
            throw new RangeError(`Error code space conflicted ([${bounds}] and [${newBounds}]).`);
        }
    });
};

const addCreator = function (creator) {
    isConflict(creator);
    creatorList.push(creator);
};

const getCreatorList = function () {
    return creatorList;
};

const checkNum = (num) => {
    const type = typeof num;
    if (type !== 'number') {
        throw new TypeError(`Expect a number, got an ${type}.`);
    }
    if (isNaN(num)) {
        throw new TypeError(`Expect a non-NaN number.`);
    }
};

class Creator {
    constructor (offset, size, name, bindStack) {
        this.offset = offset;
        this.size = size;
        checkNum(offset);
        checkNum(size);
        this.name = name;
        this.bindStack = bindStack;
        addCreator(this);
    }

    getErrorCode (index) {
        if (index >= 0) {
            const code = this.offset + index;
            const max = this.offset + this.size - 1;
            if (code > max) {
                throw new RangeError(`Error code ${code} is out of range: [${this.offset}, ${max}]`);
            }
            return code;
        }
        return this.offset;
    }

    create () {
        if (this.Error) {
            throw new Error('This creator is already initialized.');
        }
        const self = this;
        class Err extends GnatError.GnatError {
            constructor (message, index, tag, options) {
                super(message, self.getErrorCode(index), self.name, self.bindStack);
                this.tag = tag;
                options = options || {};
                this.details = options.details;
            }

            getTagSuffix () {
                return this.tag ? `.${this.tag}` : '';
            }

            getName () {
                return `${this.name}${this.getTagSuffix()}`;
            }
        }

        this.Error = Err;
        // Err.name = this.name;
        return Err;
    }
}

Object.assign(Creator, {
    getCreatorList,
    range,
    between,
    intersect,
    addCreator,
    checkNum
});

module.exports = Creator;
