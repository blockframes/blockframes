/**
 * Boolean decorator
 */
export function coerce<T extends { [key in P]: O } = any, P extends string | symbol = string | symbol, I = any,
    O = any>(coerceFn: (value: I, self: T) => O, afterFn?: (value: O, self: T) => void): PropertyDecorator {
    return function (target: T, propertyKey: P) {
        const key = Symbol();
        target[key] = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this[key];
            },
            set: afterFn
                ? function (v: I) {
                    this[key] = coerceFn.call(this, v, this);
                    afterFn.call(this, this[key], this);
                }
                : function (v: I) {
                    this[key] = coerceFn.call(this, v, this);
                }
        });
    };
}