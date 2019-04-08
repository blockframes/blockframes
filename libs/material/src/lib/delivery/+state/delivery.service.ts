import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { MaterialQuery } from '../../material/+state/material.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery } from './delivery.model';
import { createStakeholder, MovieQuery, Stakeholder } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { TemplateQuery } from '../../template/+state';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private store: DeliveryStore,
    private templateQuery: TemplateQuery,
    private db: AngularFirestore
  ) {
  }

  /** Add material to the delivery sub-collection in firebase */
  public saveMaterial(material: Material) {
    const idDelivery = this.query.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });
  }

  /** Delete material of the delivery sub-collection in firebase */
  public deleteMaterial(id: string) {
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
  }

  /** Change material 'delivered' property value to true or false when triggered */
  public deliveredToggle(material: Material, movieId: string) {
    return this.db
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ delivered: !material.delivered });
  }

  /** Initialize a new delivery in firebase
   *
   * @param templateId if templateId is present, the materials sub-collection is populated with materials from this template
   */
  public addDelivery(templateId?: string) {
    const id = this.db.createId();
    const stakeholderId = this.db.createId();
    const orgId = this.organizationQuery.getActiveId();
    const delivery = createDelivery({ id, movieId: this.movieQuery.getActiveId() });
    const stakeholder = createStakeholder({ id: stakeholderId, orgId });

    this.db.doc<Delivery>(`deliveries/${id}`).set(delivery);
    this.db.doc<Stakeholder>(`deliveries/${id}/stakeholders/${stakeholderId}`).set(stakeholder);
    this.store.setActive(id);
    if (!!templateId) {
      const filterByMaterialId = material =>
        this.templateQuery.getActive().materialsId.includes(material.id);
      const materials = this.materialQuery.getAll({ filterBy: filterByMaterialId });
      return Promise.all(
        materials.map(material =>
          this.db.doc<Material>(`deliveries/${id}/materials/${material.id}`).set(material)
        )
      );
    }
  }

  /** Delete delivery and all the sub-collections in firebase */
  public async deleteDelivery() {
    const id = this.query.getActiveId();

    this.db.doc<Delivery>(`deliveries/${id}`).delete();

    const materials: firebase.firestore.QuerySnapshot = await this.db
      .collection<Material>(`deliveries/${id}/materials`)
      .ref.get();
    const batch = this.db.firestore.batch();
    materials.forEach(doc => batch.delete(doc.ref));

    const stakeholders: firebase.firestore.QuerySnapshot = await this.db
      .collection<Stakeholder>(`deliveries/${id}/stakeholders`)
      .ref.get();
    stakeholders.forEach(doc => batch.delete(doc.ref));

    batch.commit();

    this.store.setActive(null);
  }

  public addStakeholder(stakeholder: Stakeholder, authorization: string) {
    this.db
      .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${stakeholder.id}`)
      .set({ ...stakeholder, authorizations: [authorization] });
  }
}
