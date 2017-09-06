const Creator = require('./creator');

const loadersList = [];

class Loader {
    constructor (offset, size, name, bindStack) {
        this.range = [offset, offset + size - 1];
        const creator = new Creator(offset, size, name, bindStack);
        this._creator = creator;
        this.Error = creator.create();
        this.instances = {};
        this.maxIndex = -1;
        loadersList.push(this);
    }

    addInstance (data) {
        const index = data.index;
        const tag = data.tag;
        if (this.instances[index]) {
            throw new ReferenceError(`Index ${index} is in use, please assign another index.`);
        }
        if (this.instances[tag]) {
            throw new ReferenceError(`Tag ${tag} is in use, please assign another tag.`);
        }
        Loader.compileMessage(data);
        this.instances[tag] = data;
        this.instances[index] = data;
        if (!this.maxIndex || index > this.maxIndex) {
            this.maxIndex = index;
        }
    }

    static getMessage (message, params) {
        if (typeof message === 'function') {
            return message(params);
        }
        return message;
    }

    static compileMessage (instance) {
        const message = instance.message;
        if (typeof message === 'function') {
            return;
        }
        if (!message) {
            return;
        }
        const reg = /\$\{([^}]+)\}/g;

        if (reg.test(message)) {
            instance.message = function (args) {
                const argsIsArr = args instanceof Array;
                const argsIsTruthy = !!args;
                const getArg = function (index, key) {
                    if (argsIsArr) {
                        if (args.length < index + 1) {
                            throw new ReferenceError(`Expect more than ${args.length} arguments.`);
                        }
                        return args[index];
                    }
                    if (argsIsTruthy) {
                        if (!args.hasOwnProperty(key)) {
                            throw new ReferenceError(`Expect a property "${key}."`);
                        }
                        return args[key];
                    }
                    throw new ReferenceError(`Expect an array or an object argument.`);
                };

                let str = message;
                reg.lastIndex = 0;
                let index = 0;
                let pattern;
                pattern = reg.exec(message);
                while (pattern) {
                    str = str.replace(pattern[0], getArg(index, pattern[1]));
                    index++;
                    pattern = reg.exec(message);
                }
                /* eslint no-template-curly-in-string: off */
                return str.replace(/\\\$\\\{([^\\]+)\\\}/g, '${$1}');
            };
        }
    }

    getInstance (tag) {
        const isIndex = typeof tag === 'number';
        let instance = this.instances[tag];
        if (instance) {
            return instance;
        }

        if (isIndex) {
            if (tag >= this.range[0]) {
                tag -= this.range[0];
            }
            this._creator.getErrorCode(tag);
        }
        instance = this.instances[tag];

        if (!instance) {
            const name = isIndex ? 'Index' : 'Tag';
            throw new ReferenceError(`${name} ${tag} is not initialized yet.`);
        }

        return instance;
    }

    create (tag, message, options) {
        if (typeof message === 'object') {
            options = message;
            message = null;
        }
        options = options || {};

        const instance = this.getInstance(tag);
        message = Loader.getMessage(message || instance.message, options.msgParams);
        return new this.Error(message, instance.index, instance.tag, options);
    }

    load (dataArr) {
        const self = this;
        dataArr.forEach(function (data) {
            const index = data.index;
            self._creator.getErrorCode(index);
            self.addInstance(data);
        });
    }
}

Object.assign(Loader, {
    get loadersList () {
        return loadersList;
    }
});

module.exports = Loader;
