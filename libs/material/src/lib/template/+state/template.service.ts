import { Injectable } from '@angular/core';
import { Organization } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';
import { createTemplate, Template } from './template.model';
import { Material, MaterialQuery } from '../../material/+state';
import { TemplateQuery } from './template.query';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(
    private db: AngularFirestore,
    private query: TemplateQuery,
    private materialQuery: MaterialQuery,
  ) {}

  public addTemplate(templateName: string, org: Organization): string {
    const templateId = this.db.createId();
    const template = createTemplate({
      id: templateId,
      name: templateName,
      orgId: org.id,
      orgName: org.name
    });
    this.db.doc<Template>(`templates/${templateId}`).set(template);
    return templateId;
  }

  public deleteTemplate(id: string) {
    this.db.doc<Template>(`templates/${id}`).delete();
  }

  public deleteMaterial(id: string) {
    const templateId = this.query.getActiveId();
    this.db.doc<Material>(`templates/${templateId}/materials/${id}`).delete();
  }

  public saveMaterial(material: Material) {
    const templateId = this.query.getActiveId();
    const materialId = this.db.createId();
    this.db
      .doc<Material>(`templates/${templateId}/materials/${materialId}`)
      .set({ ...material, id: materialId });
  }

  public updateMaterial(material: Material) {
    const templateId = this.query.getActiveId();
    this.db.doc<Material>(`templates/${templateId}/materials/${material.id}`).update(material);
  }

  public async saveTemplate(name: string, org: Organization) {
    const materials = this.materialQuery.getAll();
    if (materials.length > 0) {
      const template = createTemplate({
        id: this.db.createId(),
        name,
        orgId: org.id,
        orgName: org.name
      });
      this.db.doc<Template>(`templates/${template.id}`).set(template);

      const batch = this.db.firestore.batch();
      materials.forEach(material => {
        const materialWithoutStep = { ...material, step: null };
        delete materialWithoutStep.step;
        const materialRef = this.db.doc<Material>(
          `templates/${template.id}/materials/${material.id}`
        ).ref;
        return batch.set(materialRef, materialWithoutStep);
      });
      batch.commit();
    }
  }

  public async updateTemplate(name: string, org: Organization) {
    const template = this.query
      .getAll()
      .find(entity => entity.name === name && entity.orgId === org.id);
    const materials = this.materialQuery.getAll();
    if (materials.length > 0) {
      const batch = this.db.firestore.batch();
      materials.forEach(material => {
        const materialWithoutStep = { ...material, step: null };
        delete materialWithoutStep.step;
        const materialRef = this.db.doc<Material>(`templates/${template.id}/materials/${material.id}`).ref;
        return batch.set(materialRef, materialWithoutStep);
      });
      batch.commit();
    }
  }

  public nameExists(name: string, org: Organization) {
    // check if name is already used in an already template
    return this.query.hasEntity(entity => entity.name === name && entity.orgId === org.id);
  }

}
