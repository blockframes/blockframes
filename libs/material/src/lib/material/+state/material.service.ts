import { Injectable } from '@angular/core';
import { Material } from './material.model';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { FireQuery } from '@blockframes/utils';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private db: FireQuery,
    private deliveryQuery: DeliveryQuery
  ) {}

  /** Delete materials from a delivery
   * trigger backend function deleteFirestoreMaterial() (delete materials from movie)
   */
  public deleteMaterials(materials: Material[]) {
    const batch = this.db.firestore.batch();
    const deliveryId = this.deliveryQuery.getActiveId();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `deliveries/${deliveryId}/materials/${material.id}`
      ).ref;
      return batch.delete(materialRef);
    });
    batch.commit();
  }

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

  /** Update materials of a delivery */
  public async updateMaterials(materials: Material[], deliveryId: string, movieId: string) {
    const movieMaterials = await this.db.snapshot<Material[]>(`movies/${movieId}/materials`);
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`deliveries/${deliveryId}/materials/${material.id}`).ref;

        // If this material already exists in movie materials, we need to merge
        // both so we don't override specific fields (like owner and location)
        const duplicateMaterial = movieMaterials.find(movieMaterial => movieMaterial.id === material.id)
        if (!!duplicateMaterial) {
          const updatedMaterial = {...duplicateMaterial, ...material};
          return tx.update(materialRef, updatedMaterial)
        }
        else {
          return tx.update(materialRef, material)
        }
      });
    });
  }

  /** Update materials of a movie (specific fields like 'owner' and 'storage') */
  public updateMovieMaterials(materials: Material[], movieId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material)
      });
    });
  }
}
