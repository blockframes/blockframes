import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Material, createMaterial, MaterialStatus, isTheSame } from './material.model';
import { MaterialState, MaterialStore } from './material.store';
import { MovieQuery } from '@blockframes/movie';
import { Delivery } from '../../delivery/+state/delivery.model';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'movies/:movieId/materials' })
export class MovieMaterialService extends CollectionService<MaterialState> {
  constructor(
    store: MaterialStore,
    private movieQuery: MovieQuery
  ) {
    super(store);
  }

  get path() {
    const movieId = this.movieQuery.getActiveId();
    return `movies/${movieId}/materials`;
  }

  /** Returns a material to be pushed in a formGroup. */
  public createMaterial(): Material {
    const id = this.db.createId();
    return createMaterial({ id });
  }

  /** Deletes material of the movie sub-collection in firebase. */
  public async delete(materialId: string, delivery: Delivery) {
    return this.db.firestore.runTransaction(async tx => {
      const material = await this.getValue(`${materialId}`);

      // Checks if this material belongs to multiple delivery.
      // If so, update the deliveryIds, otherwise just delete it.
      if (material.deliveryIds.length === 1) {
        this.remove(material.id, { write: tx });
      } else {
        this.update(material.id, {
          deliveryIds: material.deliveryIds.filter(id => id !== delivery.id)
          },
          { write: tx });
      }
      const deliveryRef = this.db.doc(`deliveries/${delivery.id}`).ref;
      tx.update(deliveryRef, { validated: [] })
    });
  }

  /** Update materials of a delivery (materials loaded from movie). */
  public updateMaterials(materials: Material[], delivery: Delivery) {
    return this.db.firestore.runTransaction(async tx => {
      const movieMaterials = await this.getValue();

      materials.forEach(material => {
        const sameIdMaterial = movieMaterials.find(movieMaterial => movieMaterial.id === material.id);
        const sameValuesMaterial = movieMaterials.find(movieMaterial =>
          isTheSame(movieMaterial, material)
        );
        const isNewMaterial = !sameIdMaterial && !sameValuesMaterial;

        // If material from the list have no change and already exists, just return.
        const isPristine =
          !!sameIdMaterial && !!sameValuesMaterial && sameIdMaterial.id === sameValuesMaterial.id;
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
          const newMaterial = createMaterial({ ...material, id: this.db.createId() });
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
    this.add({ ...material, deliveryIds: [delivery.id] }, { write: tx });
  }

  /** Update deliveryIds of a material when this one has the same values that an other. */
  public updateMaterialDeliveryIds(sameValuesMaterial: Material, delivery: Delivery, tx: firebase.firestore.Transaction) {
    if (!sameValuesMaterial.deliveryIds.includes(delivery.id)) {
      this.update(sameValuesMaterial.id, {
        deliveryIds: [...sameValuesMaterial.deliveryIds, delivery.id]
        },
        { write: tx }
      );
    }
  }

  /** Checks if the material belongs to multiple delivery, if so: update the deliveryIds, otherwise just delete it. */
  public removeMaterial(material: Material, delivery: Delivery, sameIdMaterial: Material, tx: firebase.firestore.Transaction) {
    if (sameIdMaterial.deliveryIds.length === 1) {
      return this.remove(material.id, { write: tx });
    } else {
      return this.update(material.id, {
        deliveryIds: sameIdMaterial.deliveryIds.filter(id => id !== delivery.id)
      },
      { write: tx }
      );
    }
  }

  /** Update the property status of selected materials. */
  public updateStatus(materials: Material[], status: MaterialStatus) {
    const ids = materials.map(m => m.id);
    this.update(ids, { status });
  }

  /** Update the property isOrdered of selected materials. */
  public updateIsOrdered(materials: Material[]) {
    const ids = materials.map(material => material.id);
    this.update(ids, (material) => ({ isOrdered: !material.isOrdered }));
  }

  public updateIsPaid(materials: Material[]) {
    const ids = materials.map(material => material.id);
    this.update(ids, (material) => ({ isPaid: !material.isPaid }));
  }
}
