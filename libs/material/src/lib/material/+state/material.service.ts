import { Injectable } from '@angular/core';
import { Material, createMaterial, MaterialStatus, createMaterialTemplate, MaterialTemplate } from './material.model';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { Delivery } from '../../delivery/+state';
import { TemplateQuery } from '../../template/+state/template.query';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from './material.store';
import { snapshot } from '@blockframes/utils/helpers';
import { MaterialQuery } from './material.query';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'movies/:movieId/materials'})
export class MaterialService extends CollectionService<MaterialState> {
  constructor(
    private materialQuery: MaterialQuery,
    private deliveryQuery: DeliveryQuery,
    private templateQuery: TemplateQuery,
    store: MaterialStore
  ) {
    super(store)
  }

  //////////////////////////////
  // CRUD MATERIAL (DELIVERY) //
  //////////////////////////////

  /** Returns a material to be pushed in a formGroup. */
  public addMaterial(): Material {
    const id = this.db.createId();
    const newMaterial = createMaterial({ id });
    return newMaterial;
  }

  /** Deletes material of the movie sub-collection in firebase. */
  public delete(materialId: string, delivery: Delivery) {
    const materialRef = this.db.doc<Material>(`movies/${delivery.movieId}/materials/${materialId}`)
      .ref;
    const deliveryRef = this.db.doc<Delivery>(`deliveries/${delivery.id}`).ref;

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const materialDoc = await tx.get(materialRef)
      const material = materialDoc.data();
      // Checks if this material belongs to multiple delivery.
      // If so, update the deliveryIds, otherwise just delete it.
      if (material.deliveryIds.length === 1) {
        tx.delete(materialRef);
      } else {
        tx.update(materialRef, { deliveryIds: material.deliveryIds.filter(id => id !== delivery.id) });
      }
      tx.update(deliveryRef, { validated: [] });
    });
  }

  /** Update materials of a delivery (materials loaded from movie). */
  public async updateMaterials(materials: Material[], delivery: Delivery) {
    return this.db.firestore.runTransaction(async tx => {
      // NOTE: There is no way to query a collection within the transaction
      // So we accept that we can have 2 materials with the same properties in the database (race condition)
      const movieMaterials = await snapshot<Material[]>(`movies/${delivery.movieId}/materials`);

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
          this.setNewMaterial(material, delivery, tx);
          return;
        }

        // If there already is a material with same properties (but different id), we merge this
        // material with existing one, and push the new deliveryId into deliveryIds.
        if (!!sameValuesMaterial) {
          this.updateMaterialDeliveryIds(sameValuesMaterial, delivery, tx);
        }

        // If values are not the same, this material is considered as new and we have to create
        // and set a new material (with new Id).
        if (!sameValuesMaterial) {
          const newMaterial = createMaterial({...material, id: this.db.createId()});
          this.setNewMaterial(newMaterial, delivery, tx);
        }

        // If the Id is the same that an other material, after had created or updated, we have to remove the old material
        if (!!sameIdMaterial) {
          this.removeMaterial(material, delivery, sameIdMaterial, tx);
        }
      });
    });
  }

  /** Create a material in a movie. */
  public setNewMaterial(material: Material, delivery: Delivery, tx: firebase.firestore.Transaction) {
    const newMaterialRef = this.db.doc<Material>(`movies/${delivery.movieId}/materials/${material.id}`).ref;
    return tx.set(newMaterialRef, { ...material, deliveryIds: [delivery.id] });
  }

  /** Update deliveryIds of a material when this one has the same values that an other. */
  public updateMaterialDeliveryIds(sameValuesMaterial: Material, delivery: Delivery, tx: firebase.firestore.Transaction) {
    if (!sameValuesMaterial.deliveryIds.includes(delivery.id)) {
      const materialRef = this.db.doc<Material>(`movies/${delivery.movieId}/materials/${sameValuesMaterial.id}`).ref;
      return tx.update(materialRef, { deliveryIds: [...sameValuesMaterial.deliveryIds, delivery.id] });
    }
  }

  /** Checks if the material belongs to multiple delivery, if so: update the deliveryIds, otherwise just delete it. */
  public removeMaterial(material: Material, delivery: Delivery, sameIdMaterial: Material, tx: firebase.firestore.Transaction) {
    const materialRef = this.db.doc<Material>(`movies/${delivery.movieId}/materials/${material.id}`).ref;
    if (sameIdMaterial.deliveryIds.length === 1) {
      return tx.delete(materialRef);
    } else {
      return tx.update(materialRef, { deliveryIds: sameIdMaterial.deliveryIds.filter(id => id !== delivery.id) });
    }
  }

  /** Update the property status of selected materials. */
  public updateStatus(materials: Material[], status: MaterialStatus, movieId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const doc = this.db.doc(`movies/${movieId}/materials/${material.id}`);
      return batch.update(doc.ref, { status });
    });
    batch.commit();
  }

  /** Update the property isOrdered of selected materials. */
  public updateIsOrdered(materials: Material[], movieId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(async material => {
      const doc = this.db.doc(`movies/${movieId}/materials/${material.id}`);
      return batch.update(doc.ref, { isOrdered: !material.isOrdered });
    });
    batch.commit();
  }

  public updateIsPaid(materials: Material[], movieId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(async material => {
      const doc = this.db.doc(`movies/${movieId}/materials/${material.id}`);
      return batch.update(doc.ref, { isPaid: !material.isPaid });
    });
    batch.commit();
  }

  /** Update stepId of delivery's materials. */
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

  /** Update materials of a movie (specific fields like 'owner' and 'storage'). */
  public updateMovieMaterials(materials: Material[], movieId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material);
      });
    });
  }

  ///////////////////////////////////////////
  // CRUD MATERIAL (DELIVERY TO BE SIGNED) //
  ///////////////////////////////////////////

  /** Deletes material of the delivery sub-collection in firebase. */
  public deleteDeliveryMaterial(materialId: string, deliveryId: string) {
    return this.db.doc<Material>(`deliveries/${deliveryId}/materials/${materialId}`).delete()
  }

  /** Update materials of a delivery (materials loaded from delivery). */
  public async updateDeliveryMaterials(materials: Material[], delivery: Delivery) {
    // TODO: (ISSUE#773) We should load an update the data within a transaction.
    const deliveryMaterials = await snapshot<Material[]>(`deliveries/${delivery.id}/materials`);
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`deliveries/${delivery.id}/materials/${material.id}`).ref;
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
          const newMaterialRef = this.db.doc<Material>(`deliveries/${delivery.id}/materials/${material.id}`).ref;
          tx.set(newMaterialRef, material);
          return;
        }
        return tx.update(materialRef, material);
      });
    });
  }

  /** Update the property status of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialStatus(materials: Material[], status: MaterialStatus, deliveryId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const doc = this.db.doc(`deliveries/${deliveryId}/materials/${material.id}`);
      return batch.update(doc.ref, { status });
    });
    batch.commit();
  }

  /** Update the property isOrdered of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsOrdered(materials: Material[], deliveryId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(async material => {
      const doc = this.db.doc(`deliveries/${deliveryId}/materials/${material.id}`);
      return batch.update(doc.ref, { isOrdered: !material.isOrdered });
    });
    batch.commit();
  }

  /** Update the property isPaid of selected materials from delivery sub-collection. */
  public updateDeliveryMaterialIsPaid(materials: Material[], deliveryId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(async material => {
      const doc = this.db.doc(`deliveries/${deliveryId}/materials/${material.id}`);
      return batch.update(doc.ref, { isPaid: !material.isPaid });
    });
    batch.commit();
  }

  //////////////////////////////
  // CRUD MATERIAL (TEMPLATE) //
  //////////////////////////////

  /** Remove material from a template. */
  public deleteTemplateMaterial(id: string): Promise<void> {
    const templateId = this.templateQuery.getActiveId();
    return this.db.doc<Material>(`templates/${templateId}/materials/${id}`).delete();
  }

  /** Returns a template material to be pushed in a formGroup. */
  public addTemplateMaterial(): MaterialTemplate {
    const id = this.db.createId();
    return createMaterialTemplate({ id });
  }

  /** Update all materials of a template. */
  public updateTemplateMaterials(materials: MaterialTemplate[]) {
    const batch = this.db.firestore.batch();
    const oldMaterials = this.materialQuery.getAll();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `templates/${this.templateQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      // If material is already exists we update, if not we create it.
      if (!oldMaterials.find(oldMaterial => oldMaterial.id === material.id)) {
        return batch.set(materialRef, material);
      } else {
        return batch.update(materialRef, material);
      }
    });
    return batch.commit();
  }

  ////////////////////
  // MATERIAL UTILS //
  ////////////////////

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
