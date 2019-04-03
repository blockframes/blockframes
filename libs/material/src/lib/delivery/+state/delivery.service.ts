import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { MaterialStore } from '../../material/+state/material.store';
import { Material } from '../../material/+state/material.model';
import { TemplateQuery } from '../../template/+state/template.query';
import { Delivery, createDelivery } from './delivery.model';
import { MovieQuery, Stakeholder, createStakeholder } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private firestore: AngularFirestore,
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private materialQuery: MaterialQuery,
    private templateQuery: TemplateQuery,
    private query: DeliveryQuery,
    private store: DeliveryStore,
    private materialStore: MaterialStore,
    private db: AngularFirestore,
  ) {}

  public saveMaterial(material: Material) {
    // Add material to sub-collection materials of delivery in firebase
    const idDelivery = this.query.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });
  }

  public deleteMaterial(id: string) {
    // Delete material of sub-collection materials of delivery in firebase
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
  }

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
      tap(deliveries => this.store.set(deliveries))
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
        const id = this.query.getActiveId();
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
        const id = this.query.getActiveId();
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

  public addDelivery(id: string) {
    const orgId = this.organizationQuery.getActiveId();
    const stakeholderId = this.firestore.createId();
    const delivery = createDelivery({ id });
    const stakeholder = createStakeholder({ id: stakeholderId, orgId })
    this.firestore.doc<Delivery>(`deliveries/${id}`).set(delivery);
    this.firestore.doc<Stakeholder>(`deliveries/${id}/stakeholders/${stakeholderId}`).set(stakeholder);
    this.store.setActive(id);
  }

  public async createDelivery() {
    const deliveryId = this.firestore.createId();
    const delivery = createDelivery({
      id: deliveryId,
      movieId: this.movieQuery.getActiveId(),
      stakeholders: [this.organizationQuery.getActiveId()]
    });
    this.firestore.doc<Delivery>(`deliveries/${deliveryId}`).set(delivery);
    const template = this.templateQuery.getActive();
    const materials = this.materialQuery.getAll({
      filterBy: material => template.materialsId.includes(material.id)
    });

    return Promise.all(
      materials.map(material =>
        this.firestore
          .doc<Material>(`deliveries/${deliveryId}/materials/${material.id}`)
          .set(material)
      )
    );
  }
}
