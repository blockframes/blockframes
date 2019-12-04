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

  /** Update all materials of a template. */
  public updateTemplateMaterials(materials: MaterialTemplate[]) {
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

  /** Convert a MaterialDocument into a MaterialTemplateDocument. */
  formatToFirestore(material: Material) {
    return createMaterialTemplate(material);
  }

  async getTemplateMaterials(templateId: string) {
    const materialsSnapshot = await this.db.firestore.collection(`templates/${templateId}/materials`).get();
    const materials = [];
    materialsSnapshot.forEach(material => materials.push(material.data()));
    return materials;
  }
}
