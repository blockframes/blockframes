import { Injectable } from '@angular/core';
import { Material, MaterialStatus, createMaterial } from './material.model';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { FireQuery } from '@blockframes/utils';
import { isEqual } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(private db: FireQuery, private deliveryQuery: DeliveryQuery) {}

  /** Update stepId of delivery's materials */
  public updateStep(materials: Material[], stepId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `deliveries/${this.deliveryQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      return batch.update(materialRef, { stepId });
    });
    batch.commit();
  }

  /** Update materials of a delivery (materials loaded from movie) */
  public async updateMaterials(materials: Material[], deliveryId: string, movieId: string) {
    // TODO: (ISSUE#773) We should load an update the data within a transaction
    const movieMaterials = await this.db.snapshot<Material[]>(`movies/${movieId}/materials`);
    return this.db.firestore.runTransaction(async tx => {
      const promises = [];
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        const sameIdMaterial = movieMaterials.find(movieMaterial => movieMaterial.id === material.id);
        const sameValuesMaterial = movieMaterials.find(movieMaterial => this.isTheSame(movieMaterial, material));

        if (!!sameIdMaterial && isEqual(sameIdMaterial, material)) {
          return;
        }

        if (!!sameValuesMaterial) {
          const newDeliveryIds = [...sameValuesMaterial.deliveryIds, deliveryId];
          promises.push(tx.update(materialRef, { deliveryIds: newDeliveryIds}));
          return;
        }

        if (!!sameIdMaterial) {
          if (sameIdMaterial.deliveryIds.length === 1 && sameIdMaterial.deliveryIds.includes(deliveryId)) {
            promises.push(tx.delete(materialRef));
          }
          else {
            const index = sameIdMaterial.deliveryIds.indexOf(deliveryId);
            const newDeliveryIds = sameIdMaterial.deliveryIds.splice(index, 1);
            promises.push(tx.update(materialRef, {deliveryIds : newDeliveryIds}));
          }

          const newMaterial = createMaterial({
            ...material,
            id: this.db.createId(),
            deliveryIds: [deliveryId],
          })
          const newMaterialRef = this.db.doc<Material>(`movies/${movieId}/materials/${newMaterial.id}`).ref;
          promises.push(tx.set(newMaterialRef, newMaterial));
        }
      })
      return Promise.all(promises)
    })
  }

  /** Update materials of a movie (specific fields like 'owner' and 'storage') */
  public updateMovieMaterials(materials: Material[], movieId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material);
      });
    });
  }

  /**
 * Checks properties of two material to tell if they are the same or not.
 */
public isTheSame(matA: Material, matB: Material): boolean {
  const getProperties = ({value, description, category}: Material) => ({ value, description, category });
  return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
}
}
