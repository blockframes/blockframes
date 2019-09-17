import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery, deliveryStatuses } from './delivery.model';
import { DeliveryState, DeliveryStore, DeliveryWizard } from './delivery.store';
import { filter, map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryQuery extends QueryEntity<DeliveryState, Delivery> {
  public isDeliveryValidated$ = combineLatest([
    this.selectActive(delivery => delivery.validated),
    this.selectActive(delivery => delivery.stakeholders)
  ]).pipe(
    filter(([validated, stakeholders]) => !!validated && !!stakeholders),
    map(([validated, stakeholders]) => validated.length === stakeholders.length)
  );

  public steps$ = this.selectActive(delivery => delivery.steps);

  public mgDeadlines$ = this.selectActive(delivery => delivery.mgDeadlines);

  public currentDeadline$ = this.selectActive(delivery => delivery.mgCurrentDeadline);

  public currentStatus$ = this.selectActive(delivery => delivery.status);

  // Note: this code uses an observable to match other states systems,
  // this would be the right place to edit if deliveries statuses can be
  // customized by the user.
  public statuses$ = of(deliveryStatuses);

  constructor(protected store: DeliveryStore) {
    super(store);
  }

  public get wizard(): DeliveryWizard {
    return this.getValue().wizard;
  }

}
