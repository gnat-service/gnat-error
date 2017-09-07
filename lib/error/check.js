/**
 * Created by leaf4monkey on 09/07/2017
 */

const likeNull = value => [null, undefined].includes(value);

const check = function (value, type, optional) {
    if (optional && likeNull(value)) {
        return;
    }
    if (typeof type === 'string') {
        const t = typeof value;
        if (t !== type) {
            throw new TypeError(`Expect ${type}, got ${t}.`);
        }
    }
    if (typeof type === 'function' && !(value instanceof type)) {
        const typeName = type.name || 'a custom type';
        throw new TypeError(`Expect an instance of ${typeName} type, got ${typeof value}`);
    }
};

const checkNum = function (num, options) {
    options = Object.assign({}, {optional: false, acceptNaN: false, acceptInfinity: false}, options);
    if (!options.acceptNaN && isNaN(num) && typeof num !== 'undefined') {
        throw new TypeError(`Expect a non-NaN number.`);
    }
    if (!options.acceptInfinity && [Infinity, -Infinity].includes(num)) {
        throw new TypeError(`Expect a non-Infinity number.`);
    }
    check(num, 'number', options.optional);
};

module.exports = {
    check,
    checkNum
};
