import { Injectable } from '@angular/core';
// tslint:disable-next-line
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap, tap, filter } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { TemplateStore } from './template.store';
import { createTemplate, Template } from './template.model';
import { Material, MaterialService, MaterialQuery } from '../../material/+state';
import { TemplateQuery } from './template.query';

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
    private query: TemplateQuery,
    private materialQuery: MaterialQuery
  ) {}

  public addTemplate(templateName: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const idTemplate = this.db.createId();
    const template = createTemplate({ id: idTemplate, name: templateName });
    this.db.doc<Template>(`orgs/${idOrg}/templates/${idTemplate}`).set(template);
  }

  public addUnamedTemplate() {
    const template = createTemplate({ id: this.db.createId() });
    this.store.update({ form: template })
    // this.store.add(template);
    // this.store.setActive(template.id);
  }

  public deleteTemplate(id: string) {
    const idOrg = this.organizationQuery.getActiveId();
    this.db.doc<Template>(`orgs/${idOrg}/templates/${id}`).delete();
  }

  public async saveTemplate(name?: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const template = this.query.getActive();
    const materials = this.materialQuery.getAll({
      filterBy: material => template.materialsId.includes(material.id)
    });
    const promises: Promise<any>[] = [];

    for (const material of materials) {
      const promise = this.db.doc<Material>(`orgs/${idOrg}/materials/${material.id}`).set(material);
      promises.push(promise);
    }
    await Promise.all(promises);

    // if parameter 'name' is present, we create a new template with this name
    if (!!name) {
      const id = this.query.getActiveId();
      const { materialsId } = template;
      const newTemplate = createTemplate({ id, name, materialsId });
      this.db.doc<Template>(`orgs/${idOrg}/templates/${id}`).set(newTemplate);
      this.store.setActive(id);
      // if no parameter, we update the active template
    } else {
      this.db
        .doc<Template>(`orgs/${idOrg}/templates/${template.id}`)
        .update({ materialsId: template.materialsId });
    }
  }

  public async nameExists(name: string) {
    // check if name is already used in an already template
    return this.query.hasEntity(entity => entity.name === name);
    // const orgId = this.organizationQuery.getActiveId();
    // const querySnapshot = await this.db.collection<Template>(`orgs/${orgId}/templates`).get().toPromise();
    // const templateNames = querySnapshot.docs.map(doc => doc.data().name)
    // return templateNames.includes(name)
  }
}
