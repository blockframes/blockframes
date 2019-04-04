import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Delivery } from './delivery.model';
import { DeliveryState, DeliveryStore } from './delivery.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieQuery } from '@blockframes/movie';
import { MaterialStore, Material, materialsByCategory } from '../../material/+state';
import { filter, switchMap, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeliveryQuery extends QueryEntity<DeliveryState, Delivery> {
  constructor(
    protected store: DeliveryStore,
    private movieQuery: MovieQuery,
    private materialStore: MaterialStore,
    private db: AngularFirestore
  ) {
    super(store);
  }

  public get materialsByActiveMovie$() {
    // Get and sort the active movie's delivery's materials by category
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => materialsByCategory(materials))
    );
  }

  public get deliveriesByActiveMovie$() {
    // Get a list of deliveries for the active movie
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

  public get materialsByActiveDelivery$() {
    // Get the movie materials for the active delivery (with 'delivered' property)
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        const id = this.getActiveId();
        const deliveryMaterials = [];
        materials.forEach(material => {
          if (!!material && material.deliveriesIds.includes(id)) {
            deliveryMaterials.push(material);
          }
        });
        return deliveryMaterials;
      })
    );
  }

  public get sortedDeliveryMaterials$() {
    // Sort the active delivery's materials by category
    return this.materialsByActiveDelivery$.pipe(map(materials => materialsByCategory(materials)));
  }

  public get deliveryProgression$() {
    // Get the progression % of the delivery
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        const id = this.getActiveId();
        const deliveredMaterials = [];
        const totalMaterials = [];
        materials.forEach(material => {
          if (!!material && material.deliveriesIds.includes(id)) {
            totalMaterials.push(material);
            if (material.delivered === true) {
              deliveredMaterials.push(material);
            }
          }
        });
        return Math.round((deliveredMaterials.length / (totalMaterials.length / 100)) * 10) / 10;
      })
    );
  }

  public get movieProgression$() {
    // Get the progression % of the movie's deliveries
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => {
        const deliveredMaterials = [];
        const totalMaterials = [];
        materials.forEach(material => {
          if (!!material) {
            totalMaterials.push(material);
            if (material.delivered === true) {
              deliveredMaterials.push(material);
            }
          }
        });
        return Math.round((deliveredMaterials.length / (totalMaterials.length / 100)) * 10) / 10;
      })
    );
  }
}
