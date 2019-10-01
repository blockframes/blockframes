import { Injectable } from '@angular/core';
import { Organization, PermissionsService, OrganizationQuery } from '@blockframes/organization';
import { createTemplate, Template } from './template.model';
import { Material, convertMaterialToMaterialTemplate, MaterialTemplate } from '../../material/+state';
import { TemplateQuery } from './template.query';
import { FireQuery, Query } from '@blockframes/utils';
import { TemplateStore } from './template.store';
import { switchMap, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

const templateQuery = (id: string): Query<Template> => ({
  path: `templates/${id}`
});

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(
    private db: FireQuery,
    private query: TemplateQuery,
    private store: TemplateStore,
    private organizationQuery: OrganizationQuery,
    private permissionsService: PermissionsService
  ) {}

  /** Create a template without materials. */
  public async addTemplate(templateName: string): Promise<string> {
    const templateId = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const organizationDoc = this.db.doc<Organization>(`orgs/${organization.id}`);
    const template = createTemplate({
      id: templateId,
      name: templateName,
      orgId: organization.id
    });

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const organizationSnap = await tx.get(organizationDoc.ref);
      const templateIds = organizationSnap.data().templateIds || [];

      // Create document permissions
      await this.permissionsService.createDocAndPermissions(template, organization, tx);

      // Update the organization templateIds
      const nextTemplateIds = [...templateIds, template.id];
      tx.update(organizationDoc.ref, {templateIds: nextTemplateIds});
    })

    return templateId;
  }

  /** Delete a template and materials subcollection. */
  public async deleteTemplate(templateId: string): Promise<void> {
    const org = this.organizationQuery.getValue().org;
    const templateIds = org.templateIds.filter(id => id !== templateId);
    const organizationDoc = this.db.doc<Organization>(`orgs/${org.id}`);
    const templateDoc = this.db.doc<Template>(`templates/${templateId}`);

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      tx.delete(templateDoc.ref);
      tx.update(organizationDoc.ref, { templateIds })
      this.store.remove(templateId)
    })
  }

  /** Save a delivery as new template. */
  public async saveAsTemplate(materials: Material[], templateName: string) {
    if (materials.length > 0) {
      // Add a new template
      const templateId = await this.addTemplate(templateName);

      // Add the delivery's materials in the template
      const batch = this.db.firestore.batch();
      materials.forEach(material => {
        // Convert the material to MaterialTemplate to save only the corresponding fields on the database
        const materialTemplate = convertMaterialToMaterialTemplate(material);
        const materialDoc = this.db.doc<Material>(`templates/${templateId}/materials/${material.id}`);
        return batch.set(materialDoc.ref, materialTemplate);
      });
      return batch.commit();
    }
  }

  /** Update template with delivery's materials. */
  public async updateTemplate(materials: Material[], name: string) {
    const templates = this.query.getAll();
    const selectedTemplate = templates.find(template => template.name === name);
    const templateMaterials = await this.db.snapshot<MaterialTemplate[]>(`templates/${selectedTemplate.id}/materials`);

    if (materials.length > 0) {
      const batch = this.db.firestore.batch();
      // Delete all materials of template
      templateMaterials.forEach(material => {
        const materialDoc = this.db.doc<MaterialTemplate>(`templates/${selectedTemplate.id}/materials/${material.id}`);
        return batch.delete(materialDoc.ref);
      });
      // Add delivery's materials in template
      materials.forEach(material => {
        // Convert the material to MaterialTemplate to save only the corresponding fields on the database
        const materialTemplate = convertMaterialToMaterialTemplate(material);
        const materialDoc = this.db.doc<MaterialTemplate>(`templates/${selectedTemplate.id}/materials/${material.id}`);
        return batch.set(materialDoc.ref, materialTemplate);
      });
      return batch.commit();
    }
  }

  /** Check if name is already used in an already template */
  public nameExists(name: string) {
    const templates = this.query.getAll();
    return templates.find(template => template.name === name);
  }

  /** Subscribe on organization templates (outside the TemplateListGuard) and set the template store. */
  public subscribeOnTemplates() {
    return this.organizationQuery
      .select(state => state.org.templateIds)
      .pipe(
        switchMap(ids => {
          if (!ids || ids.length === 0) throw new Error('No template yet')
          const queries = ids.map(id => this.db.fromQuery<Template>(templateQuery(id)))
          return combineLatest(queries);
        }),
        tap(templates => this.store.set(templates))
      );
  }
}
