import { Injectable } from '@angular/core';
// tslint:disable-next-line
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap, tap, filter, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { TemplateStore } from './template.store';
import { createTemplate, Template } from './template.model';
import { Material} from '../../material/+state/material.model';
import { TemplateQuery } from './template.query';
import { MaterialService } from '../../material/+state/material.service';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  public subscribeOnOrganizationTemplates$ = this.organizationQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Template>(`orgs/${id}/templates`).valueChanges()),
    tap(templates => this.store.set(templates))
  );

  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: TemplateStore,
    private materialService: MaterialService,
    private query: TemplateQuery
  ) {}

  public addTemplate(templateName: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const idTemplate = this.db.createId();
    const template = createTemplate({ id: idTemplate, name: templateName });
    this.db.doc<Template>(`orgs/${idOrg}/templates/${idTemplate}`).set(template);
  }

  public deleteTemplate(id: string) {
    const idOrg = this.organizationQuery.getActiveId();
    this.db.doc<Template>(`orgs/${idOrg}/templates/${id}`).delete();
  }

  public updateCategory(newCategory: string, materials: Material[]) {
    for (const material of materials) {
      this.materialService.updateMaterial(material, { category: newCategory } as Material);
    }
  }

  public deleteCategory(materials: Material[]) {
    for (const material of materials) {
      this.materialService.deleteMaterial(material.id);
    }
  }

  public async saveTemplate(templateName?: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const template = this.query.getActive();
    const materials = this.query.unsortedMaterialsByTemplate();
    const promises: Promise<any>[] = [];

    for (const material of materials) {
      const promise = this.db.doc<Material>(`orgs/${idOrg}/materials/${material.id}`).set(material);
      promises.push(promise);
    }
    await Promise.all(promises);
    if (!!templateName) {
      const newTemplateId = this.db.createId();
      const newTemplate = createTemplate({
        id: newTemplateId,
        name: templateName,
        materialsId: template.materialsId
      });
      this.db.doc<Template>(`orgs/${idOrg}/templates/${newTemplateId}`).set(newTemplate);
    } else {
      this.db
        .doc<Template>(`orgs/${idOrg}/templates/${template.id}`)
        .update({ materialsId: template.materialsId });
    }
  }
}
