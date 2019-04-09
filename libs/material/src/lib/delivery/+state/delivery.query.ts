import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery } from './delivery.model';
import { DeliveryState, DeliveryStore } from './delivery.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieQuery, Stakeholder, StakeholderStore, StakeholderService } from '@blockframes/movie';
import { MaterialStore } from '../../material/+state/material.store';
import { Material } from '../../material/+state/material.model';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { materialsByCategory } from '../../material/+state/material.query';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryQuery extends QueryEntity<DeliveryState, Delivery> {
  constructor(
    protected store: DeliveryStore,
    private movieQuery: MovieQuery,
    private materialStore: MaterialStore,
    private stakeholderStore: StakeholderStore,
    private stakeholderService: StakeholderService,
    private db: AngularFirestore
  ) {
    super(store);
  }

  /** Return the active movie materials sorted by category */
  public get materialsByActiveMovie$() {
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => materialsByCategory(materials))
    );
  }

  /** Return a list of deliveries for the active movie */
  public get deliveriesByActiveMovie$() {
    return this.movieQuery.selectActiveId().pipe(
      filter(id => !!id),
      switchMap(id =>
        this.db
          .collection<Delivery>('deliveries', ref => ref.where('movieId', '==', id))
          .valueChanges()
      ),
      tap(deliveries => this.store.set(deliveries))
    );
  }

  /** Return the active delivery materials sorted by category */
  public get materialsByActiveDelivery$() {
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
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

  // public get stakeholdersByActiveDelivery$(){
  //   return this.selectActive().pipe(
  //     filter(delivery => !!delivery),
  //     switchMap(delivery => this.db.collection<Stakeholder>(`deliveries/${delivery.id}/stakeholders`).valueChanges()),
  //     tap(stakeholders => this.stakeholderStore.set(stakeholders))
  //   );
  // }

  public get stakeholdersByActiveDelivery$() {
    return this.db
      .collection<Stakeholder>(`deliveries/${this.getActiveId()}/stakeholders`)
      .valueChanges();
  }

  /** Return the progression % of the delivery */
  public get deliveryProgression$() {
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
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

  /** Return the progression % of the movie's deliveries */
  public get movieProgression$() {
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => {
        const deliveredMaterials = materials.filter(material => !!material.delivered);
        return Math.round((deliveredMaterials.length / (materials.length / 100)) * 10) / 10;
      })
    );
  }

  public isStakerholderHasSigned$(id: string) {
    return this.selectActive().pipe(
      filter(delivery => !!delivery),
      map(delivery => delivery.validated.includes(id))
    )
  }
}
