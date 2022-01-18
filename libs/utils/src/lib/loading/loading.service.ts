import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingSpinnerService {
  private _states = new BehaviorSubject<Record<string, boolean>>({});
  loading$ = this._states .asObservable().pipe(
    map(states => Object.values(states).some(state => state))
  );

  setState(loading: boolean, key: string = 'default') {
    const state = this._states .value;
    if (loading) {
      state[key] = loading;
    } else {
      delete state[key];
    }
    this._states.next(state);
  }
  getState(key: string) {
    return this._states.value[key];
  }
}
