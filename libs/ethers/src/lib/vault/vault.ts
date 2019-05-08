import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";

export interface IVault {
  get(key: string): Promise<string>
  set(key: string, value: string): Promise<string>
}

// TODO : build a state around the vault
@Injectable({ providedIn: 'root' })
export class Vault {
  // TODO : remove when using a store
  private keys = new BehaviorSubject({});
  select(key: string) {
    const currentValue = localStorage.getItem(key);
    if (currentValue) {  // Make sure the current value exist
      const current = this.keys.getValue();
      this.keys.next({...current, [key]: currentValue });
    }
    return this.keys.asObservable().pipe(
      map(keys => keys[key]),
      distinctUntilChanged((x, y) => x !== y),
    );
  }

  async get(key: string) {
    return localStorage.getItem(key)
  }
  async set(key: string, value: string) {
    const current = this.keys.getValue();
    this.keys.next({ ...current, [key]: value });
    return localStorage.setItem(key, value);
  }
}
