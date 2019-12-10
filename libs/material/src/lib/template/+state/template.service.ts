import { Injectable } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Material } from '../../material/+state/material.model';
import { createTemplate, Template } from './template.model';
import { TemplateQuery } from './template.query';
import { TemplateState, TemplateStore } from './template.store';
import { TemplateMaterialService } from '../../material/+state/template-material.service';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'templates' })
export class TemplateService extends CollectionService<TemplateState>{
  /** An observable of organization's templateIds */
  private templateIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.templateIds),
    distinctUntilChanged(
      (old, curr) => old.every(tpl => curr.includes(tpl))
    )
  );

  constructor(
    store: TemplateStore,
    private templateMaterialService: TemplateMaterialService,
    private organizationService: OrganizationService,
    private query: TemplateQuery,
    private organizationQuery: OrganizationQuery
  ) {
    super(store)
  }

  /** Gets every templateIds of the user active organization and sync them. */
  public syncOrgTemplates() {
    return this.templateIds$.pipe(
      switchMap(ids => this.syncManyDocs(ids))
    )
  }

  /** Create a template with an id, a name and an orgId. */
  public createTemplate(templateName: string): Template {
    const template = createTemplate({
      id: this.db.createId(),
      name: templateName,
      orgId: this.organizationQuery.getActiveId()
    });

    this.add(template);

    return template;
  }

  /** Hook that triggers when a template is added to the database. */
  onCreate(template: Template, write: WriteOptions) {
    const organization = this.organizationQuery.getActive();
    this.organizationService.update(organization.id, { templateIds: [...organization.templateIds, template.id] });
   }

  /** Hook that triggers when a template is removed from the database. */
  onDelete(templateId: string, write: WriteOptions) {
    const organization = this.organizationQuery.getActive();
    const templateIds = organization.templateIds.filter(id => id !== templateId);

    this.organizationService.update(organization.id, { templateIds });
  }

  /** Save a delivery as new template. */
  public async saveAsTemplate(materials: Material[], templateName: string) {
    if (materials.length > 0) {
      // Add a new template
      const template = this.createTemplate(templateName);

      // Set active the template, and add the delivery's materials in the template
      this.store.setActive(template.id);
      this.templateMaterialService.add(materials);
    }
  }

  /** Update template with delivery's materials. */
  public async updateTemplate(materials: Material[], name: string) {
    const templates = this.query.getAll();
    const selectedTemplate = templates.find(template => template.name === name);
    const templateMaterials = await this.templateMaterialService.getTemplateMaterials(selectedTemplate.id);

    if (materials.length > 0) {
      const batch = this.db.firestore.batch();
      // Delete all materials of template
      const ids = templateMaterials.map(({ id }) => id);
      this.templateMaterialService.remove(ids, { write: batch });
      // Add delivery's materials in template
      this.templateMaterialService.add(materials, { write: batch });
      return batch.commit();
    }
  }

  /** Check if name is already used in an already template */
  public nameExists(name: string) {
    const templates = this.query.getAll();
    return templates.find(template => template.name === name);
  }

}
