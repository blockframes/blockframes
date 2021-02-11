import { BehaviorSubject, Observable } from "rxjs";

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