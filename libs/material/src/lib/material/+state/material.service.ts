import { Injectable } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Material } from './material.model';
import { OrganizationQuery } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  public subscribeOnOrganizationMaterials$ = this.organizationQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Material>(`orgs/${id}/materials`).valueChanges()),
    tap(materials => this.store.set(materials))
  );

  public subscribeOnDeliveryMaterials$ = this.deliveryQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Material>(`deliveries/${id}/materials`).valueChanges()),
    tap(materials => this.store.set(materials))
  );

  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: MaterialStore,
    private deliveryQuery: DeliveryQuery
  ) {}

}
