import { NgZone } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';

/**
 * Navigation triggered outside Angular zone #8263
 * https://stackoverflow.com/questions/50928645/running-an-observable-into-a-zone-js
 * TODO #7595 #7273
 * @param zone 
 * @returns 
 */
export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) => {
    return new Observable(observer => {
      const onNext = (value: T) => zone.run(() => observer.next(value));
      const onError = (e: any) => zone.run(() => observer.error(e));
      const onComplete = () => zone.run(() => observer.complete());
      return source.subscribe({ next: (v) => onNext(v), error: (e) => onError(e), complete: () => onComplete() });
    });
  };
}