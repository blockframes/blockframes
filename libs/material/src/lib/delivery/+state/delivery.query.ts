import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery } from './delivery.model';
import { DeliveryState, DeliveryStore } from './delivery.store';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class DeliveryQuery extends QueryEntity<DeliveryState, Delivery> {


  constructor(
    protected store: DeliveryStore,
    private db: AngularFirestore
  ) {
    super(store);
  }
}
