/**
 * @description this decorator helps you to transform a value into a boolean value.
 * @example <my-custom-html-tag autoplay></my-customhtml-tag> and in the component
 * @example @Input() @boolean autoplay = false will result into a true value
 * @param coerceFn 
 * @param afterFn 
 */
export function coerce<T extends { [key in P]: O } = any,
    P extends string | symbol = string | symbol,
    I = any, O = any>(coerceFn: (value: I, self: T) => O,
        afterFn?: (value: O, self: T) => void): PropertyDecorator {
    return function (target: T, propertyKey: P) {
        const _key = Symbol();
        target[_key] = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this[_key];
            },
            set: afterFn
                ? function (v: I) {
                    this[_key] = coerceFn.call(this, v, this);
                    afterFn.call(this, this[_key], this);
                }
                : function (v: I) {
                    this[_key] = coerceFn.call(this, v, this);
                }
        });
    };
}