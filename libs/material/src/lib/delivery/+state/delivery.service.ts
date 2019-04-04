import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { materialsByCategory, MaterialQuery } from '../../material/+state/material.query';
import { MaterialStore } from '../../material/+state/material.store';
import { Material } from '../../material/+state/material.model';
import { Delivery, createDelivery } from './delivery.model';
import { MovieQuery, Stakeholder, createStakeholder } from '@blockframes/movie';
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
  ) {}

  public saveMaterial(material: Material) {
    // Add material to sub-collection materials of delivery in firebase
    const idDelivery = this.query.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });
  }

  public deleteMaterial(id: string) {
    // Delete material of sub-collection materials of delivery in firebase
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
  }

  public deliveredToggle(material: Material, movieId: string) {
    // Change material 'delivered' property value to true or false when triggered
    return this.db
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ delivered: !material.delivered });
  }

  public addDelivery(id: string, templateId?: string) {
    const orgId = this.organizationQuery.getActiveId();
    const stakeholderId = this.db.createId();
    const delivery = createDelivery({ id, movieId: this.movieQuery.getActiveId() });
    const stakeholder = createStakeholder({ id: stakeholderId, orgId });

    this.db.doc<Delivery>(`deliveries/${id}`).set(delivery);
    this.db
      .doc<Stakeholder>(`deliveries/${id}/stakeholders/${stakeholderId}`)
      .set(stakeholder);
    this.store.setActive(id);
    if (!!templateId) {
      // if function got templateId as an argument, we populate materials subcollection with materials from active template
      const materials = this.materialQuery.getAll({
        filterBy: material => this.templateQuery.getActive().materialsId.includes(material.id)
      });
      return Promise.all(
        materials.map(material =>
          this.db.doc<Material>(`deliveries/${id}/materials/${material.id}`).set(material)
        )
      );
    }
  }

  public deleteDelivery() {
    const id = this.query.getActiveId();
    this.db.doc<Delivery>(`deliveries/${id}`).delete();
    this.store.setActive(null);
  }
}
