import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Access } from '@blockframes/model';

export interface ConsentsState extends EntityState<Access<Date>, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'consents' })
export class ConsentsStore extends EntityStore<ConsentsState> {
  constructor() {
    super();
  }
}
