import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery } from './delivery.model';
import { DeliveryState, DeliveryStore } from './delivery.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieQuery, StakeholderQuery } from '@blockframes/movie';
import { MaterialStore } from '../../material/+state/material.store';
import { Material } from '../../material/+state/material.model';
import { switchMap, map, tap, filter } from 'rxjs/operators';
import { materialsByCategory } from '../../material/+state/material.query';
import { combineLatest } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';
import { FireQuery} from '@blockframes/utils';

@Injectable({
  providedIn: 'root'
})
export class DeliveryQuery extends QueryEntity<DeliveryState, Delivery> {
  public isDeliveryValidated$ = combineLatest([
    this.selectActive(delivery => delivery.validated),
    this.stakeholderQuery.selectAll()
  ]).pipe(
    filter(([validated, stakeholders]) => !!validated && !!stakeholders),
    map(([validated, stakeholders]) => validated.length === stakeholders.length)
  );

  constructor(
    protected store: DeliveryStore,
    private movieQuery: MovieQuery,
    private materialStore: MaterialStore,
    private stakeholderQuery: StakeholderQuery,
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private fireQuery: FireQuery
  ) {
    super(store);
  }

  /** Returns the active movie materials sorted by category */
  public get materialsByActiveMovie$() {
    return this.movieQuery.selectActive().pipe(
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => materialsByCategory(materials))
    );
  }

  /** Returns a list of deliveries for the active movie */
  public get deliveriesByActiveMovie$() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(id =>
        this.db
          .collection<Delivery>('deliveries', ref => ref.where('movieId', '==', id))
          .valueChanges()
      ),
      tap(deliveries => this.store.set(deliveries))
    );
  }

  /** Returns the active delivery materials sorted by category */
  public get materialsByActiveDelivery$() {
    return this.movieQuery.selectActive().pipe(
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        const id = this.getActiveId();
        return materials.filter(material => material.deliveriesIds.includes(id));
      }),
      map(materials => materialsByCategory(materials))
    );
  }

  /** Returns the progression % of the delivery */
  public get deliveryProgression$() {
    return this.movieQuery.selectActive().pipe(
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        const id = this.getActiveId();
        const totalMaterials = materials.filter(material => material.deliveriesIds.includes(id));
        const deliveredMaterials = totalMaterials.filter(material => !!material.delivered);
        return Math.round((deliveredMaterials.length / (totalMaterials.length / 100)) * 10) / 10;
      })
    );
  }

  public deliveryProgressionById(id: string) {
    return this.movieQuery.selectActive().pipe(
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        const totalMaterials = materials.filter(material => material.deliveriesIds.includes(id));
        const deliveredMaterials = totalMaterials.filter(material => !!material.delivered);
        return Math.round((deliveredMaterials.length / (totalMaterials.length / 100)) * 10) / 10;
      })
    );
  }

  /** Returns the progression % of the movie's deliveries */
  public get movieProgression$() {
    return this.movieQuery.selectActive().pipe(
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => {
        const deliveredMaterials = materials.filter(material => !!material.delivered);
        return Math.round((deliveredMaterials.length / (materials.length / 100)) * 10) / 10;
      })
    );
  }

  public hasStakeholderSigned$(id: string) {
    return this.selectActive().pipe(
      filter(delivery => !!delivery),
      map(delivery => delivery.validated.includes(id))
    );
  }

  /** Find the stakeholder from the movie and logged user organizations */
  public findActiveStakeholder() {
    const stakeholders = this.stakeholderQuery.getAll();
    const orgIds = this.organizationQuery.getAll().map(org => org.id);
    return stakeholders.find(({ orgId }) => orgIds.includes(orgId));
  }
}
