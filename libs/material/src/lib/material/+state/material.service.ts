import { Injectable } from '@angular/core';
import { filter, switchMap, tap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Material } from './material.model';
import { OrganizationQuery } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { MovieQuery } from '@blockframes/movie';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: MaterialStore,
    private deliveryQuery: DeliveryQuery,
    private movieQuery: MovieQuery,
    private storage: AngularFireStorage,
  ) {}

  public subscribeOnDeliveryMaterials$() {
    // TODO : switch this to FireQuery
    return this.deliveryQuery.selectActive().pipe(
      filter(delivery => !!delivery),
      switchMap(delivery =>
        this.db
          .collection<any>(`deliveries/${delivery.id}/materials`)
          .valueChanges()
          .pipe(
            map(materials => {
              return materials.map(material => {
                const step = delivery.steps.find(deliveryStep => deliveryStep.id === material.stepId);
                return { ...material, step }
              });
            })
          )
      ),
      tap(materials => this.store.set(materials))
    );
  }

  public subscribeOnMovieMaterials$() {
    // TODO : switch this to FireQuery
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap(movie =>
        this.db
          .collection<any>(`movies/${movie.id}/materials`)
          .valueChanges()
          .pipe(
            map(materials =>
              materials.map(material =>({
                ...material,
                step: this.deliveryQuery.getActive().steps.find(step => step.id === material.stepId)
              }))
            )
          )
      ),
      tap(materials => this.store.set(materials))
    );
  }

  public subscribeOnAllOrgsMaterials$() {
    return this.organizationQuery.selectAll().pipe(
      switchMap(orgs =>
        combineLatest(
          orgs.map(org => this.db.collection<Material>(`orgs/${org.id}/materials`).valueChanges())
        )
      ),
      // for each org, we have an array of materials.
      // This flattens the array of array into a single array of materials:
      map(materials => [].concat.apply([], materials) as Material[]),
      tap(materials => this.store.set(materials))
    );
  }

  public deleteMaterials(materials: Material[]) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `deliveries/${this.deliveryQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      return batch.delete(materialRef);
    });
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `movies/${this.movieQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      return batch.delete(materialRef);
    });
    batch.commit();
  }

  public changeStep(materials: Material[], stepId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `deliveries/${this.deliveryQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      return batch.update(materialRef, { stepId });
    });
    batch.commit();
  }
}

