import { Injectable } from '@angular/core';
import { Organization, PermissionsService, OrganizationQuery } from '@blockframes/organization';
import { createTemplate, Template } from './template.model';
import { Material, MaterialQuery } from '../../material/+state';
import { TemplateQuery } from './template.query';
import { FireQuery } from '@blockframes/utils';
import { TemplateStore } from './template.store';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(
    private db: FireQuery,
    private query: TemplateQuery,
    private store: TemplateStore,
    private materialQuery: MaterialQuery,
    private organizationQuery: OrganizationQuery,
    private permissionsService: PermissionsService
  ) {}

  public async addTemplate(templateName: string): Promise<string> {
    const templateId = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const template = createTemplate({
      id: templateId,
      name: templateName,
      orgId: organization.id
    });

    // Create document permissions
    await this.permissionsService.createDocAndPermissions(template, organization);

    // Push the new id in organization.templateIds
    await this.db
      .doc<Organization>(`orgs/${organization.id}`)
      .update({ templateIds: [...organization.templateIds, templateId] });

    return templateId;
  }

  public deleteTemplate(templateId: string): Promise<void> {
    const organization = this.organizationQuery.getValue().org;
    const templateIds = organization.templateIds.filter(id => id !== templateId);
    const organizationDoc = this.db.doc<Organization>(`orgs/${organization.id}`);
    const templateDoc = this.db.doc<Template>(`templates/${templateId}`);

    const batch = this.db.firestore.batch();
    // Delete the template from the templates collection
    batch.delete(templateDoc.ref);
    // Delete templateId from org.templateIds
    batch.update(organizationDoc.ref, { templateIds });
    // Remove the template from the templates store
    this.store.remove(templateId);

    return batch.commit();

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

  /** Save a delivery as new template */
  public async saveAsTemplate(templateName: string) {
    const materials = this.materialQuery.getAll();
    if (materials.length > 0) {
      // Add a new template
      const templateId = this.addTemplate(templateName);

      // Add the delivery's materials in the template
      const batch = this.db.firestore.batch();
      materials.forEach(material => {
        const materialWithoutStep = { ...material, step: null };
        delete materialWithoutStep.step;
        const materialDoc = this.db.doc<Material>(`templates/${templateId}/materials/${material.id}`);
        return batch.set(materialDoc.ref, materialWithoutStep);
      });
      batch.commit();
    }
  }

  /** Update template with delivery's materials */
  public async updateTemplate(name: string) {
    const organizationId = this.organizationQuery.getValue().org.id;
    const template = this.query
      .getAll()
      .find(entity => entity.name === name && entity.orgId === organizationId);
    const templateMaterials = await this.db.snapshot<any>(`templates/${template.id}/materials`);
    const deliveryMaterials = this.materialQuery.getAll();
    if (deliveryMaterials.length > 0) {
      const batch = this.db.firestore.batch();
      // Delete all materials of template
      templateMaterials.forEach(material => {
        const materialDoc = this.db.doc<Material>(`templates/${template.id}/materials/${material.id}`);
        return batch.delete(materialDoc.ref);
      });
      // Add delivery's materials in template
      deliveryMaterials.forEach(material => {
        const materialWithoutStep = { ...material, step: null };
        delete materialWithoutStep.step;
        const materialDoc = this.db.doc<Material>(`templates/${template.id}/materials/${material.id}`);
        return batch.set(materialDoc.ref, materialWithoutStep);
      });
      batch.commit();
    }
  }

  /** Check if name is already used in an already template */
  public nameExists(name: string, organization: Organization) {
    return this.query.hasEntity(entity => entity.name === name && entity.orgId === organization.id);
  }
}
