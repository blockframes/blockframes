import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Delivery } from '../../delivery/+state/delivery.model';
import { TemplateQuery } from '../../template/+state/template.query';
import { createMaterial, createMaterialTemplate, Material, MaterialStatus, MaterialTemplate } from './material.model';
import { MaterialQuery } from './material.query';
import { MaterialState, MaterialStore } from './material.store';

@Injectable({
  providedIn: 'root'
})
/** Redefining path in guards. */
@CollectionConfig({ path: 'deliveries/:deliveryId/materials'})
export class MaterialService extends CollectionService<MaterialState> {
  subcollectionPath: string;

  constructor(
    private materialQuery: MaterialQuery,
    private templateQuery: TemplateQuery,
    store: MaterialStore
  ) {
    super(store)
  }

  // get path() {
  //   return this.subcollectionPath;
  // }

  //////////////////////////////
  // CRUD MATERIAL (DELIVERY) //
  //////////////////////////////

  /** Returns a material to be pushed in a formGroup. */
  public createMaterial(): Material {
    const id = this.db.createId();
    return createMaterial({ id });
  }

  /** Update stepId of materials of a delivery to empty string. */
  public removeStepIdDeliveryMaterials(materials: Material[], deliveryId: string) {
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    // TODO: issue#1352 use a multiple update
    materials.forEach(material => this.update(material.id, { stepId: '' }));
  }

  ///////////////////////////////////////////
  // CRUD MATERIAL (DELIVERY TO BE SIGNED) //
  ///////////////////////////////////////////

  /** Deletes material of the delivery sub-collection in firebase. */
  public deleteDeliveryMaterial(materialId: string, deliveryId: string) {
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    this.remove(materialId)
  }

  /** Update materials of a delivery (materials loaded from delivery). */
  public async updateDeliveryMaterials(materials: Material[], delivery: Delivery) {
    // TODO: (ISSUE#773) We should load an update the data within a transaction.
    this.subcollectionPath = `deliveries/${delivery.id}/materials`;
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
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    materials.forEach(material => this.update(material.id, { status }));
  }

  /** Update the property isOrdered of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsOrdered(materials: Material[], deliveryId: string) {
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    materials.forEach(material => this.update(material.id, { isOrdered: !material.isOrdered }));
  }

  /** Update the property isPaid of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsPaid(materials: Material[], deliveryId: string) {
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    materials.forEach(material => this.update(material.id, { isPaid: !material.isPaid }));
  }

  //////////////////////////////
  // CRUD MATERIAL (TEMPLATE) //
  //////////////////////////////

  /** Remove material from a template. */
  public deleteTemplateMaterial(id: string) {
    this.subcollectionPath = `templates/${this.templateQuery.getActiveId()}/materials`;
    this.remove(id)
  }

  /** Returns a template material to be pushed in a formGroup. */
  public addTemplateMaterial(): MaterialTemplate {
    const id = this.db.createId();
    return createMaterialTemplate({ id });
  }

  /** Update all materials of a template. */
  public updateTemplateMaterials(materials: MaterialTemplate[]) {
    this.subcollectionPath = `templates/${this.templateQuery.getActiveId()}/materials`;
    const oldMaterials = this.materialQuery.getAll();
    materials.forEach(material => {
      // If material is already exists we update, if not we create it.
      if (!oldMaterials.find(oldMaterial => oldMaterial.id === material.id)) {
        this.add(createMaterial(material));
      } else {
        return this.update(material.id, material);
      }
    });
  }

  /** Convert a MaterialDocument into a MaterialTemplateDocument if the subcollectionPath is set on templates. */
  formatToFirestore(material: Material): any {
    return this.subcollectionPath.includes('templates')
      ? createMaterialTemplate(material)
      : material;
  }

  ////////////////////
  // MATERIAL UTILS //
  ////////////////////

  /** Returns a snapshot of template materials and sets the subcollectionPath. */
  public async getTemplateMaterials(templateId: string) {
    this.subcollectionPath = `templates/${templateId}/materials`;
    return this.getValue();
  }

  /** Returns a snapshot of delivery materials and sets the subcollectionPath. */
  public async getDeliveryMaterials(deliveryId: string) {
    this.subcollectionPath = `deliveries/${deliveryId}/materials`;
    return this.getValue();
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
