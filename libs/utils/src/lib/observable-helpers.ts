
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Default structure for BehaviorSubject
 * includes an observable, getter and setter
 */
export class BehaviorStore<T> {
  private state: BehaviorSubject<T>;
  $: Observable<T>;
  constructor(initial: T) {
    this.state = new BehaviorSubject<T>(initial);
    this.$ = this.state.asObservable();
  }
  get value(): T {
    return this.state.getValue();
  }
  set value(value: T) {
    this.state.next(value);
  }
}

/**
 * Observable operator that executes its callback when the source observable complete.
 * The callback is then executed with the last emitted value of the observable.
 * @note It's basically a wrapper around rxjs's `finalize()` but with the last emitted value passed as an argument.
 * @note Rxjs's `finalize()`: https://rxjs.dev/api/operators/finalize
 * @note Github discussion about this code snippets: https://github.com/ReactiveX/rxjs/issues/4803
 * @example
 * of(1, 2, 3, 4).pipe(
    finalizeWithValue(v => console.log('final:', v)),
  ).subscribe(v => console.log('current:', v));
  // current: 1
  // current: 2
  // current: 3
  // current: 4
  // final: 4
*/
export function finalizeWithValue<T>(callback: (value: T) => void) {
  return (source: Observable<T>) => defer(() => {
    let lastValue: T;
    return source.pipe(
      tap(value => lastValue = value),
      finalize(() => callback(lastValue)),
    )
  })
}
