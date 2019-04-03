import { Injectable } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Material } from './material.model';
// tslint:disable-next-line
import { OrganizationQuery } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { TemplateStore } from '../../template/+state/template.store';
import { TemplateQuery } from '../../template/+state/template.query';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { Template } from '../../template/+state';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  public subscribeOnOrganizationMaterials$ = this.organizationQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Material>(`orgs/${id}/materials`).valueChanges()),
    tap(materials => this.store.set(materials))
  );

  public subscribeOnDeliveryMaterials$ = this.deliveryQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Material>(`deliveries/${id}/materials`).valueChanges()),
    tap(materials => this.store.set(materials))
  );

  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: MaterialStore,
    private templateQuery: TemplateQuery,
    private templateStore: TemplateStore,
    private deliveryQuery: DeliveryQuery
  ) {}

  public deleteMaterialInTemplate(id: string) {
    const idOrg = this.organizationQuery.getActiveId();

    // delete material and materialId of materialsId of sub-collection template in firebase
    const template = this.templateQuery.getActive();
    const materialsId = [...template.materialsId];
    const index = materialsId.indexOf(id);
    materialsId.splice(index, 1);

    this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
    this.db.doc<Material>(`orgs/${idOrg}/materials/${id}`).delete();
  }

  public saveMaterialInTemplate(material: Material) {
    // Add material to sub-collection materials of organization in firebase
    const idOrg = this.organizationQuery.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`orgs/${idOrg}/materials/${idMaterial}`)
      .set({ ...material, ...{ id: idMaterial } });

    // Add materialId of materialsId of sub-collection template in firebase
    const template = this.templateQuery.getActive();
    const materialsId = [...template.materialsId];
    materialsId.push(idMaterial);
    this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
  }

  public saveMaterialInDelivery(material: Material) {
    // Add material to sub-collection materials of delivery in firebase
    const idDelivery = this.deliveryQuery.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, ...{ id: idMaterial } });
  }

  public deleteMaterialInDelivery(id: string) {
    // Delete material of sub-collection materials of delivery in firebase
    const idDelivery = this.deliveryQuery.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
  }
}
