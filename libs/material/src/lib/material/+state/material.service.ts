import { Injectable } from '@angular/core';
import { Material, createMaterial, MaterialStatus, createTemplateMaterial } from './material.model';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { FireQuery } from '@blockframes/utils';
import { Delivery } from '../../delivery/+state';
import { MovieQuery } from '@blockframes/movie';
import { TemplateQuery } from '../../template/+state/template.query';


@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private db: FireQuery,
    private deliveryQuery: DeliveryQuery,
    private movieQuery: MovieQuery,
    private templateQuery: TemplateQuery
  ) {}

  //////////////////////////////
  // CRUD MATERIAL (DELIVERY) //
  //////////////////////////////

  /** Returns a material to be pushed in a formGroup */
  public addMaterial(): Material {
    const id = this.db.createId();
    const newMaterial = createMaterial({ id });
    return newMaterial;
  }

  /** Deletes material of the movie sub-collection in firebase */
  public deleteMaterial(materialId: string, delivery: Delivery) {
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

  /** Update materials of a delivery (materials loaded from movie) */
  public async updateMaterials(materials: Material[], deliveryId: string, movieId: string) {
    // TODO: (ISSUE#773) We should load an update the data within a transaction
    const movieMaterials = await this.db.snapshot<Material[]>(`movies/${movieId}/materials`);
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        const sameIdMaterial = movieMaterials.find(movieMaterial => movieMaterial.id === material.id);
        const sameValuesMaterial = movieMaterials.find(movieMaterial => this.isTheSame(movieMaterial, material));
        const isNewMaterial = !movieMaterials.find(movieMaterial => movieMaterial.id === material.id) && !sameValuesMaterial;

        // If material from the list have no change and already exists, just return.
        const isPristine = !!sameIdMaterial && !!sameValuesMaterial && sameIdMaterial.id === sameValuesMaterial.id;
        if (isPristine) {
          return;
        }

        // We check if material is brand new. If so, we just add it to database and return.
        if (isNewMaterial) {
          const newMaterialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;

          tx.set(newMaterialRef, { ...material, deliveryIds: [deliveryId] });
          return;
        }

        // If there already is a material with same properties (but different id), we merge this
        // material with existing one, and push the new deliveryId into deliveryIds.
        if (!!sameValuesMaterial) {
          const target = sameValuesMaterial;

          if (!target.deliveryIds.includes(deliveryId)) {
            const targetRef = this.db.doc<Material>(`movies/${movieId}/materials/${target.id}`).ref;

            tx.update(targetRef, { deliveryIds: [...target.deliveryIds, deliveryId] });
          }
        // If values are not the same, this material is considered as new and we have to create
        // and set a new material with updated fields.
        } else {
          const target = createMaterial({
            ...material,
            id: this.db.createId(),
            deliveryIds: [deliveryId]
          });
          const targetRef = this.db.doc<Material>(`movies/${movieId}/materials/${target.id}`).ref;

          tx.set(targetRef, target);
        }

        const source = sameIdMaterial;

        // Checks if this material belongs to multiple delivery.
        // If so, update the deliveryIds, otherwise just delete it.
        if (source.deliveryIds.length === 1) {
          tx.delete(materialRef);
        } else {
          tx.update(materialRef, { deliveryIds: source.deliveryIds.filter(id => id !== deliveryId) });
        }
      });
    });
  }

  /** Update the property status of materials */
  public updateStatus(materials: Material[], status: MaterialStatus, movieId: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const doc = this.db.doc(`movies/${movieId}/materials/${material.id}`);
      return batch.update(doc.ref, { status });
    });
    batch.commit();
  }

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

  /** Update materials of a movie (specific fields like 'owner' and 'storage') */
  public updateMovieMaterials(materials: Material[], movieId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material);
      });
    });
  }

  //////////////////////////////
  // CRUD MATERIAL (TEMPLATE) //
  //////////////////////////////

  /** Remove material of template */
  public deleteTemplateMaterial(id: string): Promise<void> {
    const templateId = this.templateQuery.getActiveId();
    return this.db.doc<Material>(`templates/${templateId}/materials/${id}`).delete();
  }

  /** Returns a material of template to be pushed in a formGroup */
  public addTemplateMaterial(): Material {
    const id = this.db.createId();
    return createTemplateMaterial({ id });
  }

  /** Update all materials of template */
  public updateTemplateMaterials(materials: Material[]) {
    const batch = this.db.firestore.batch();
    const oldMaterials = this.templateQuery.getActive().materials;
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `templates/${this.templateQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      // If material is already exists we update, if not we create it
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

  /**
   * Checks properties of two material to tell if they are the same or not.
   */
  public isTheSame(matA: Material, matB: Material): boolean {
    const getProperties = ({ value, description, category }: Material) => ({
      value,
      description,
      category
    });
    return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
  }
}
