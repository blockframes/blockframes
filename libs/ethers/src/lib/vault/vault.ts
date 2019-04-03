import { Injectable } from "@angular/core";

export interface IVault {
  get(key: string): Promise<string>
  set(key: string, value: string): Promise<string>
}

@Injectable({ providedIn: 'root' })
export class Vault {
  async get(key: string) {
    return localStorage.getItem(key)
  }
  async set(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
}
