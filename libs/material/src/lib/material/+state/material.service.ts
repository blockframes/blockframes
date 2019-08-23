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
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`movies/${movieId}/materials/${material.id}`).ref;
        const sameIdMaterial = movieMaterials.find(
          movieMaterial => movieMaterial.id === material.id
        );
        const sameValuesMaterial = movieMaterials.find(movieMaterial =>
          this.isTheSame(movieMaterial, material)
        );

        if (
          !!sameIdMaterial &&
          !!sameValuesMaterial &&
          sameIdMaterial.id === sameValuesMaterial.id
        ) {
          return;
        }

        if (!!sameValuesMaterial) {
          const target = sameValuesMaterial;

          if (!target.deliveryIds.includes(deliveryId)) {
            const targetRef = this.db.doc<Material>(`movies/${movieId}/materials/${target.id}`).ref;

            tx.update(targetRef, { deliveryIds: [...target.deliveryIds, deliveryId] });
          }

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

        if (source.deliveryIds.length === 1) {
          tx.delete(materialRef);
        } else {
          tx.update(materialRef, {
            deliveryIds: source.deliveryIds.filter(id => id !== deliveryId)
          });
        }
      });
    });
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
    const getProperties = ({ value, description, category }: Material) => ({
      value,
      description,
      category
    });
    return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
  }
}
