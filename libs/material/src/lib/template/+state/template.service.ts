import { Injectable } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap, tap, map, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { TemplateStore } from './template.store';
import { createTemplate, Template } from './template.model';
import { Material, MaterialQuery } from '../../material/+state';
import { TemplateQuery } from './template.query';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: TemplateStore,
    private query: TemplateQuery,
    private materialQuery: MaterialQuery,
    private templateQuery: TemplateQuery
  ) {}

  public addTemplate(templateName: string, orgId: string) {
    const idTemplate = this.db.createId();
    const template = createTemplate({ id: idTemplate, name: templateName });
    this.db.doc<Template>(`orgs/${orgId}/templates/${idTemplate}`).set(template);
  }

  public addUnamedTemplate() {
    const template = createTemplate({ id: this.db.createId() });
    this.store.update({ form: template });
    // this.store.add(template);
    // this.store.setActive(template.id);
  }

  public deleteTemplate(id: string) {
    const orgId = this.templateQuery.getEntity(id).orgId;
    this.db.doc<Template>(`orgs/${orgId}/templates/${id}`).delete();
  }

  public deleteMaterial(id: string) {
    const orgId = this.templateQuery.getActive().orgId;

    // delete material and materialId of materialsId of sub-collection template in firebase
    const template = this.query.getActive();
    const materialsId = [...template.materialsId];
    const index = materialsId.indexOf(id);
    materialsId.splice(index, 1);

    this.db.doc<Template>(`orgs/${orgId}/templates/${template.id}`).update({ materialsId });
    this.db.doc<Material>(`orgs/${orgId}/materials/${id}`).delete();
  }

  public saveMaterial(material: Material) {
    // Add material to sub-collection materials of organization in firebase
    const orgId = this.templateQuery.getActive().orgId;
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`orgs/${orgId}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });

    // Add materialId of materialsId of sub-collection template in firebase
    const template = this.query.getActive();
    const materialsId = [...template.materialsId, idMaterial];
    this.db.doc<Template>(`orgs/${orgId}/templates/${template.id}`).update({ materialsId });
  }

  public async saveTemplate(name: string) {
    const orgId = this.organizationQuery.getActiveId();
    const materials = this.materialQuery.getAll();
    if (materials.length > 0) {
      const template = createTemplate({ id: this.db.createId(), name });
      template.materialsId = materials.map(({ id }) => id);
      this.db.doc<Template>(`orgs/${orgId}/templates/${template.id}`).set(template);
      return Promise.all(
        materials.map(material =>
          this.db.doc<Material>(`orgs/${orgId}/materials/${material.id}`).set(material)
        )
      );
    }
  }

  public async nameExists(name: string) {
    // check if name is already used in an already template
    return this.query.hasEntity(entity => entity.name === name);
  }

  public subscribeOnAllOrgsTemplates$() {
    return this.organizationQuery.selectAll().pipe(
      switchMap(orgs =>
        combineLatest(
          orgs.map(org =>
            this.db
              .collection<Template>(`orgs/${org.id}/templates`)
              .valueChanges()
              .pipe(
                map(templates =>
                  templates.map(template => ({ ...template, orgId: org.id, orgName: org.name }))
                )
              )
          )
        )
      ),
      // for each org, we have an array of templates.
      // This flattens the array of array into a single array of templates:
      map(templatesPerOrgs => [].concat.apply([], templatesPerOrgs) as Template[]),
      tap(templates => this.store.set(templates))
    );
  }

  public subscribeOnOrganizationTemplates$() {
    return this.organizationQuery.selectActiveId().pipe(
      filter(id => !!id),
      switchMap(id => this.db.collection<Template>(`orgs/${id}/templates`).valueChanges()),
      tap(templates => this.store.set(templates))
    );
  }
}
