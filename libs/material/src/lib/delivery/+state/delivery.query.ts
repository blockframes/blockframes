import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery, deliveryStatuses, MGDeadline, State } from './delivery.model';
import { DeliveryState, DeliveryStore, DeliveryWizard } from './delivery.store';
import { MovieQuery } from '@blockframes/movie';
import { Material } from '../../material/+state/material.model';
import { filter, map, switchMap } from 'rxjs/operators';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { combineLatest, Observable, of } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';
import { TemplateView } from '../../template/+state';
import { FireQuery } from '@blockframes/utils';

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

  public currentStatus$ = this.selectActive(delivery => delivery.state);

  // Note: this code uses an observable to match other states systems,
  // this would be the right place to edit if deliveries statuses can be
  // customized by the user.
  public statuses$ = of(deliveryStatuses);

  /** Returns the active delivery materials sorted by category */
  public currentTemplate$: Observable<TemplateView> = this.materialQuery
    .selectAll()
    .pipe(map(materials => materialsByCategory(materials)));

  constructor(
    protected store: DeliveryStore,
    private movieQuery: MovieQuery,
    private materialQuery: MaterialQuery,
    private organizationQuery: OrganizationQuery,
    private db: FireQuery
  ) {
    super(store);
  }

  get hasStep(): boolean {
    return this.getActive().steps.length > 0;
  }

  public hasStakeholderSigned$(id: string) {
    return this.selectActive().pipe(
      filter(delivery => !!delivery),
      map(delivery => delivery.validated.includes(id))
    );
  }

  public get wizard(): DeliveryWizard {
    return this.getValue().wizard;
  }

  /** Find the stakeholder from the movie and logged user organizations */
  public findActiveStakeholder() {
    const organizationId = this.organizationQuery.getValue().org.id;
    const stakeholders = this.movieQuery.getActive().stakeholders;
    return stakeholders.find(({ id }) => id === organizationId);
  }
}
