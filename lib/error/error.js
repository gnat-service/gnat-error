class GnatError extends Error {
    constructor (message, code, name, bindStack) {
        super(message);
        this.errorCode = code;
        this.name = name || 'GnatError';
        this.bindStack = !!bindStack;
    }

    getName () {
        return this.name;
    }

    toJSON () {
        const r = {
            name: this.getName(),
            errorCode: this.errorCode,
            message: this.message,
            details: this.details
        };
        if (this.bindStack) {
            r.stack = this.stack;
        }
        return r;
    }
}

let ErrorClass = GnatError;

module.exports = {
    get GnatError () {
        return ErrorClass;
    },
    setGnatErrorClass (Clazz) {
        ErrorClass = Clazz;
    }
};
