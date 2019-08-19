import { Injectable } from '@angular/core';
import { Material } from './material.model';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { FireQuery } from '@blockframes/utils';
import { MaterialQuery } from './material.query';
import { Delivery } from '../../delivery/+state';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private db: FireQuery,
    private deliveryQuery: DeliveryQuery,
    private query: MaterialQuery
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
  public async updateMaterials(materials: Material[], deliveryId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`deliveries/${deliveryId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material)
      });
    });
  }
}
