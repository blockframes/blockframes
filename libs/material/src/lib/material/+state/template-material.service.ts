import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from './material.store';
import {
  MaterialTemplate,
  createMaterialTemplate,
  createMaterial,
  Material
} from './material.model';
import { MaterialQuery } from './material.query';
import { TemplateQuery } from '../../template/+state/template.query';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'templates/:templateId/materials' })
export class TemplateMaterialService extends CollectionService<MaterialState> {
  constructor(
    store: MaterialStore,
    private templateQuery: TemplateQuery,
    private materialQuery: MaterialQuery
  ) {
    super(store);
  }

  get path() {
    const templateId = this.templateQuery.getActiveId();
    return `templates/${templateId}/materials`;
  }

  /** Remove material from a template. */
  public deleteTemplateMaterial(id: string) {
    this.remove(id);
  }

  /** Returns a template material to be pushed in a formGroup. */
  public addTemplateMaterial(): MaterialTemplate {
    const id = this.db.createId();
    return createMaterialTemplate({ id });
  }

  /** If material is already exists we update, if not we create it. */
  public upsertTemplateMaterials(
      material: MaterialTemplate,
      isExisting: boolean,
      batch: firestore.WriteBatch
    ) {
    return isExisting
      ? this.update(material.id, material, { write: batch })
      : this.add(createMaterial(material), { write: batch })
  }

  /** Update all materials of a template. */
  public updateTemplateMaterials(materials: MaterialTemplate[]) {
    const batch = this.db.firestore.batch();
    const oldMaterials = this.materialQuery.getAll();
    materials.forEach(material => {
      const isExisting = !!oldMaterials.find(oldMaterial => oldMaterial.id === material.id);
      this.upsertTemplateMaterials(material, isExisting, batch);
    });
    // Not using templateService here so as not to cause a circular dependency, templateService using templateMaterialService.
    const templateRef = this.db.doc(`templates/${this.templateQuery.getActiveId()}`).ref;
    batch.update(templateRef, { updated: new Date() });

    batch.commit();
  }

  /** Convert a MaterialDocument into a MaterialTemplateDocument. */
  formatToFirestore(material: Material) {
    return createMaterialTemplate(material);
  }

  async getTemplateMaterials(templateId: string) {
    const materialsSnapshot = await this.db.collection(`templates/${templateId}/materials`).ref.get();
    return materialsSnapshot.docs.map(doc => doc.data() as Material);
  }
}
