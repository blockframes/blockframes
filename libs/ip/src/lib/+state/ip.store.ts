import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Ip } from './ip.model';

export interface IpState extends EntityState<Ip> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ip', idKey: 'hash' })
export class IpStore extends EntityStore<IpState, Ip> {
  constructor() {
    super();
  }
}
