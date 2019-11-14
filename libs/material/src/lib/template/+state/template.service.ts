import { Injectable } from '@angular/core';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { createTemplate } from './template.model';
import { Material, MaterialService } from '../../material/+state';
import { TemplateQuery } from './template.query';
import { TemplateStore, TemplateState } from './template.store';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'templates' })
export class TemplateService extends CollectionService<TemplateState>{
  /** An observable of organization's templateIds */
  private templateIds$ = this.organizationQuery.select('org').pipe(
    map(org => org.templateIds),
    distinctUntilChanged(
      (old, curr) => old.every(tpl => curr.includes(tpl))
    )
  );

  constructor(
    private query: TemplateQuery,
    private organizationQuery: OrganizationQuery,
    private materialService: MaterialService,
    store: TemplateStore
  ) {
    super(store)
  }

  /** Gets every templateIds of the user active organization and sync them. */
  public syncOrgTemplates() {
    return this.templateIds$.pipe(
      switchMap(ids => this.syncManyDocs(ids))
    )
  }

  /** Create a template without materials. */
  public async addTemplate(templateName: string): Promise<string> {
    const templateId = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const template = createTemplate({
      id: templateId,
      name: templateName,
      orgId: organization.id
    });

    // Add the template to the database
    this.add(template);

    // Update the organization templateIds
    this.db.doc<Organization>(`orgs/${organization.id}`).update({templateIds: [...organization.templateIds, template.id]});

    return templateId;
  }

  /** Delete a template and materials subcollection. */
  public async deleteTemplate(templateId: string): Promise<void> {
    const organization = this.organizationQuery.getValue().org;
    const templateIds = organization.templateIds.filter(id => id !== templateId);

    this.remove(templateId);
    this.db.doc<Organization>(`orgs/${organization.id}`).update({templateIds});
  }

  /** Save a delivery as new template. */
  public async saveAsTemplate(materials: Material[], templateName: string) {
    if (materials.length > 0) {
      // Add a new template
      const templateId = await this.addTemplate(templateName);

      // Add the delivery's materials in the template
      this.materialService.getTemplateMaterials(templateId);
      materials.forEach(material => this.materialService.add(material));
    }
  }

  /** Update template with delivery's materials. */
  public async updateTemplate(materials: Material[], name: string) {
    const templates = this.query.getAll();
    const selectedTemplate = templates.find(template => template.name === name);
    const templateMaterials = await this.materialService.getTemplateMaterials(selectedTemplate.id);

    if (materials.length > 0) {
      // Delete all materials of template
      templateMaterials.forEach(material => this.materialService.remove(material.id));
      // Add delivery's materials in template
      materials.forEach(material => this.materialService.add(material));
    }
  }

  /** Check if name is already used in an already template */
  public nameExists(name: string) {
    const templates = this.query.getAll();
    return templates.find(template => template.name === name);
  }

}
