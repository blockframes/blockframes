// T = {key is in P, value is O}
// P extends the object string or symbol that equals to a string or extends symbol
// I is any
// O is any
// Boolean takes in two functions
// coerceFn with to parameters, value is type of of, so its any
// self typeof T and t is {key is in P, value is O} 
// The function returns O (any)
// Second paramter is also a function wihich takes two parameters
// value type of O (any)
// self which is type of T {key is in P, value is O}
// then curried function which target is T {key is in P, value is O}
// and propertyKey P, P extends the object string or symbol that equals to a string or extends symbol 


/**
 * 
 * @param coerceFn 
 * @param afterFn 
 */
export function coerce<T extends { [key in P]: O } = any,
    P extends string | symbol = string | symbol,
    I = any, O = any>(coerceFn: (value: I, self: T) => O,
        afterFn?: (value: O, self: T) => void): PropertyDecorator {
    return function (target: T, propertyKey: P) {
        console.log(target, propertyKey)
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