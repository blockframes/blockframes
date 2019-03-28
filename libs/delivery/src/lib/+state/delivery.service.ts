import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  Material,
  MaterialStore
} from '../../../../../apps/delivery/delivery/src/app/material/+state';
import { MovieQuery } from '@blockframes/movie';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { DeliveryStore } from './delivery.store';
import { Delivery } from '@blockframes/delivery';
import { DeliveryQuery } from './delivery.query';

function materialsByCategory(materials: Material[]) {
  return materials.reduce((acc, item) => {
    return {
      ...acc,
      [item.category.toUpperCase()]: [...(acc[item.category.toUpperCase()] || []), item]
    };
  }, {});
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private firestore: AngularFirestore,
    private movieQuery: MovieQuery,
    private deliveryQuery: DeliveryQuery,
    private deliveryStore: DeliveryStore,
    private materialStore: MaterialStore
  ) {}

  public deliveredToggle(material: Material, movieId: string) {
    // Change material 'delivered' property value to true or false when triggered
    return this.firestore
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ delivered: !material.delivered });
  }

  public get deliveryMaterialsByActiveMovie$() {
    // Get and sort the active movie's delivery's materials by category
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.firestore.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      map(materials => materialsByCategory(materials))
    );
  }

  public get deliveriesByActiveMovie$() {
    // Get a list of deliveries for the active movie
    return this.movieQuery.selectActiveId().pipe(
      filter(id => !!id),
      switchMap(id =>
        this.firestore
          .collection<Delivery>('deliveries', ref => ref.where('movieId', '==', id))
          .valueChanges()
      ),
      tap(deliveries => this.deliveryStore.set(deliveries))
    );
  }

  public get materialsByActiveDelivery$() {
    // Get the movie materials for the active delivery (with 'delivered' property)
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.firestore.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        let id: string;
        this.deliveryQuery.selectActiveId().subscribe(data => (id = data));
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
        this.firestore.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
      ),
      tap(materials => this.materialStore.set(materials)),
      map(materials => {
        let id: string;
        this.deliveryQuery.selectActiveId().subscribe(data => (id = data));
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
        this.firestore.collection<Material>(`movies/${movie.id}/materials`).valueChanges()
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
