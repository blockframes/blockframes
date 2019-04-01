import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Delivery } from './delivery.model';

export interface DeliveryState extends EntityState<Delivery>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'deliveries', idKey: 'id' })
export class DeliveryStore extends EntityStore<DeliveryState, Delivery> {
  constructor() {
    super(initialState);
  }

}
