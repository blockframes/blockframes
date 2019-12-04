import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Delivery } from '../../delivery/+state/delivery.model';
import { createMaterial, Material, MaterialStatus } from './material.model';
import { MaterialState, MaterialStore } from './material.store';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'deliveries/:deliveryId/materials'})
export class DeliveryMaterialService extends CollectionService<MaterialState> {
  constructor(
    private deliveryQuery: DeliveryQuery,
    store: MaterialStore
  ) {
    super(store)
  }

  get path() {
    const deliveryId = this.deliveryQuery.getActiveId();
    return `deliveries/${deliveryId}/materials`;
  }

  /** Returns a material to be pushed in a formGroup. */
  public createMaterial(): Material {
    const id = this.db.createId();
    return createMaterial({ id });
  }

  /** Update stepId of materials of a delivery to empty string. */
  public removeStepIdDeliveryMaterials(materials: Material[]) {
    // TODO: issue#1352 use a multiple update
    materials.forEach(material => this.update(material.id, { stepId: '' }));
  }

  /** Deletes material of the delivery sub-collection in firebase. */
  public deleteDeliveryMaterial(materialId: string) {
    this.remove(materialId)
  }

  /** Update materials of a delivery (materials loaded from delivery). */
  public async updateDeliveryMaterials(materials: Material[]) {
    // TODO: (ISSUE#773) We should load an update the data within a transaction.
    const deliveryMaterials = await this.getValue();

    materials.forEach(material => {
      const sameIdMaterial = deliveryMaterials.find(deliveryMaterial => deliveryMaterial.id === material.id);
      const sameValuesMaterial = deliveryMaterials.find(deliveryMaterial => this.isTheSame(deliveryMaterial, material));
      const isNewMaterial = !deliveryMaterials.find(deliveryMaterial => deliveryMaterial.id === material.id) && !sameValuesMaterial;

      // If material from the list have no change and already exists, just return.
      const isPristine = !!sameIdMaterial && !!sameValuesMaterial && sameIdMaterial.id === sameValuesMaterial.id;
      if (isPristine) {
        return;
      }

      // We check if material is brand new. If so, we just add it to database and return.
      if (isNewMaterial) {
        this.add(material);
        return;
      }
      return this.update(material.id, material);
    });
  }

  /** Update the property status of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialStatus(materials: Material[], status: MaterialStatus, deliveryId: string) {
    materials.forEach(material => this.update(material.id, { status }));
  }

  /** Update the property isOrdered of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsOrdered(materials: Material[]) {
    materials.forEach(material => this.update(material.id, { isOrdered: !material.isOrdered }));
  }

  /** Update the property isPaid of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsPaid(materials: Material[]) {
    materials.forEach(material => this.update(material.id, { isPaid: !material.isPaid }));
  }

  /**  Checks properties of two material to tell if they are the same or not. */
  public isTheSame(matA: Material, matB: Material): boolean {
    const getProperties = ({ value, description, category, stepId }: Material) => ({
      value,
      description,
      category,
      stepId
    });
    return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
  }
}
