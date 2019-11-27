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
@CollectionConfig({ path: 'toBeDefined'})
export class MaterialService extends CollectionService<MaterialState> {
  subcollectionPath: string;

  constructor(
    private materialQuery: MaterialQuery,
    private templateQuery: TemplateQuery,
    store: MaterialStore
  ) {
    super(store)
  }

  get path() {
    return this.subcollectionPath;
  }

  //////////////////////////////
  // CRUD MATERIAL (DELIVERY) //
  //////////////////////////////

  /** Returns a material to be pushed in a formGroup. */
  public createMaterial(): Material {
    const id = this.db.createId();
    return createMaterial({ id });
  }

  /** Deletes material of the movie sub-collection in firebase. */
  public async delete(materialId: string, delivery: Delivery) {
    const material = await this.getValue(`movies/${delivery.movieId}/materials/${materialId}`)
    this.subcollectionPath = `movies/${delivery.movieId}/materials`

      // Checks if this material belongs to multiple delivery.
      // If so, update the deliveryIds, otherwise just delete it.
      if (material.deliveryIds.length === 1) {
        this.remove(material.id);
      } else {
        this.update(material.id, { deliveryIds: material.deliveryIds.filter(id => id !== delivery.id) });
      }
      this.db.doc(`deliveries/${delivery.id}`).update({ validated: [] });
  }

  /** Update materials of a delivery (materials loaded from movie). */
  public async updateMaterials(materials: Material[], delivery: Delivery) {

    this.subcollectionPath = `movies/${delivery.movieId}/materials`;
    const movieMaterials = await this.getValue();

    materials.forEach(material => {
      const sameIdMaterial = movieMaterials.find(movieMaterial => movieMaterial.id === material.id);
      const sameValuesMaterial = movieMaterials.find(movieMaterial => this.isTheSame(movieMaterial, material));
      const isNewMaterial = !sameIdMaterial && !sameValuesMaterial;

      // If material from the list have no change and already exists, just return.
      const isPristine = !!sameIdMaterial && !!sameValuesMaterial && sameIdMaterial.id === sameValuesMaterial.id;
      if (isPristine) {
        return;
      }

      // We check if material is brand new. If so, we just add it to database and return.
      if (isNewMaterial) {
        this.setNewMaterial(material, delivery);
        return;
      }

      // If there already is a material with same properties (but different id), we merge this
      // material with existing one, and push the new deliveryId into deliveryIds.
      if (!!sameValuesMaterial) {
        this.updateMaterialDeliveryIds(sameValuesMaterial, delivery);
      }

      // If values are not the same, this material is considered as new and we have to create
      // and set a new material (with new Id).
      if (!sameValuesMaterial) {
        const newMaterial = createMaterial({...material, id: this.db.createId()});
        this.setNewMaterial(newMaterial, delivery);
      }

      // If the Id is the same that an other material, after had created or updated, we have to remove the old material
      if (!!sameIdMaterial) {
        this.removeMaterial(material, delivery, sameIdMaterial);
      }
    })
  }

  /** Create a material in a movie. */
  public setNewMaterial(material: Material, delivery: Delivery) {
    this.subcollectionPath = `movies/${delivery.movieId}/materials`;
    this.add({ ...material, deliveryIds: [delivery.id] })
  }

  /** Update deliveryIds of a material when this one has the same values that an other. */
  public updateMaterialDeliveryIds(sameValuesMaterial: Material, delivery: Delivery) {
    this.subcollectionPath = `movies/${delivery.movieId}/materials`;
    if (!sameValuesMaterial.deliveryIds.includes(delivery.id)) {
      this.update(sameValuesMaterial.id, { deliveryIds: [...sameValuesMaterial.deliveryIds, delivery.id] })
    }
  }

  /** Checks if the material belongs to multiple delivery, if so: update the deliveryIds, otherwise just delete it. */
  public removeMaterial(material: Material, delivery: Delivery, sameIdMaterial: Material) {
    this.subcollectionPath = `movies/${delivery.movieId}/materials`;
    if (sameIdMaterial.deliveryIds.length === 1) {
      return this.remove(material.id)
    } else {
      return this.update(material.id, { deliveryIds: sameIdMaterial.deliveryIds.filter(id => id !== delivery.id) });
    }
  }

  /** Update the property status of selected materials. */
  public updateStatus(materials: Material[], status: MaterialStatus, movieId: string) {
    this.subcollectionPath = `movies/${movieId}/materials`;
    materials.forEach(material => this.update(material.id, { status }));
  }

  /** Update the property isOrdered of selected materials. */
  public updateIsOrdered(materials: Material[], movieId: string) {
    this.subcollectionPath = `movies/${movieId}/materials`;
    materials.forEach(material => this.update(material.id, { isOrdered: !material.isOrdered }));
  }

  public updateIsPaid(materials: Material[], movieId: string) {
    this.subcollectionPath = `movies/${movieId}/materials`;
    materials.forEach(material => this.update(material.id, { isPaid: !material.isPaid }));
  }

  /** Update materials of a movie (specific fields like 'owner' and 'storage'). */
  public updateMovieMaterials(materials: Material[], movieId: string) {
    this.subcollectionPath = `movies/${movieId}/materials`;
      materials.forEach(material => this.update(material.id, material));
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

  /** Returns a snapshot of movie materials and sets the subcollectionPath. */
  public async getMovieMaterials(movieId: string) {
    this.subcollectionPath = `movies/${movieId}/materials`;
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
