import { Injectable } from '@angular/core';
import { switchMap, tap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Material } from './material.model';
import { OrganizationQuery } from '@blockframes/organization';
import { MaterialStore } from './material.store';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { MovieQuery } from '@blockframes/movie';
import { FireQuery } from '@blockframes/utils';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private organizationQuery: OrganizationQuery,
    private db: FireQuery,
    private store: MaterialStore,
    private deliveryQuery: DeliveryQuery,
    private movieQuery: MovieQuery,
  ) {}

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
    const deliveryId = this.deliveryQuery.getActiveId();
    const movieId = this.movieQuery.getActiveId();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `deliveries/${deliveryId}/materials/${material.id}`
      ).ref;
      return batch.delete(materialRef);
    });
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `movies/${movieId}/materials/${material.id}`
      ).ref;
      return batch.delete(materialRef);
    });
    // TODO: Check if material.deliveriesIds length is > 1, as a material can also be part of another delivery
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

