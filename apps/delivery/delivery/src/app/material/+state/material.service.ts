import { Injectable } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';
import { createMaterial, Material } from './material.model';
// tslint:disable-next-line
import { OrganizationQuery } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { TemplateStore } from '../../template/+state/template.store';
import { TemplateQuery } from '../../template/+state/template.query';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  public subscribeOnOrganizationMaterials$ = this.organizationQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Material>(`orgs/${id}/materials`).valueChanges()),
    tap(materials => this.store.set(materials))
  );

  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: MaterialStore,
    private templateQuery: TemplateQuery,
    private templateStore: TemplateStore,
  ) {}

  public deleteMaterial(id: string) {
    const idOrg = this.organizationQuery.getActiveId();

    // delete materialId of materialsId of sub-collection template
    const template = this.templateQuery.getActive();
    const materialsId = [...template.materialsId];
    const index = materialsId.indexOf(id);
    materialsId.splice(index, 1);

    this.templateStore.update(template.id, { materialsId })
    this.store.remove(id)
    // this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
    // this.db.doc<Material>(`orgs/${idOrg}/materials/${id}`).delete();
  }

  public updateMaterial(material: Material, form: Material) {
    const idOrg = this.organizationQuery.getActiveId();
    this.store.update(material.id, { ...material, ...form })
    // this.db
    //   .doc<Material>(`orgs/${idOrg}/materials/${material.id}`)
    //   .update({ ...material, ...form });
  }

  public addMaterial(material: Material) {
    // Add material to sub-collection materials of organization
    const idOrg = this.organizationQuery.getActiveId();
    const idMaterial = this.db.createId();
    this.store.add({...material, ...{id: idMaterial}});
    //this.db.doc<Material>(`orgs/${idOrg}/materials/${idMaterial}`).set(material);

    // Add materialId of materialsId of sub-collection template
    const template = this.templateQuery.getActive();
    const materialsId = [...template.materialsId];
    materialsId.push(idMaterial);
    this.templateStore.update(template.id, { materialsId })
    //this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
  }
}
