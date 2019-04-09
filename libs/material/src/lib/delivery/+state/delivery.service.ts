import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { MaterialQuery } from '../../material/+state/material.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery } from './delivery.model';
import {
  createStakeholder,
  MovieQuery,
  Stakeholder,
  StakeholderQuery,
  StakeholderService
} from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { TemplateQuery } from '../../template/+state';
import { Router } from '@angular/router';
import { switchMap, tap, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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
    private stakeholderQuery: StakeholderQuery,
    private router: Router,
    private db: AngularFirestore
  ) {}

  /** Adds material to the delivery sub-collection in firebase */
  public saveMaterial(material: Material) {
    const idDelivery = this.query.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });
  }

  /** Deletes material of the delivery sub-collection in firebase */
  public deleteMaterial(id: string) {
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
  }

  /** Changes material 'delivered' property value to true or false when triggered */
  public deliveredToggle(material: Material, movieId: string) {
    return this.db
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ delivered: !material.delivered });
  }

  /** Initializes a new delivery in firebase
   *
   * @param templateId if templateId is present, the materials sub-collection is populated with materials from this template
   */
  public addDelivery(templateId?: string) {
    const id = this.db.createId();
    const stakeholderId = this.db.createId();
    const movieId = this.movieQuery.getActiveId();
    // TODO: const orgId = this.movieQuery.getActive().orgId
    const orgId = this.organizationQuery.getActiveId();
    const delivery = createDelivery({ id, movieId });
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

  /**
   * Navigates to delivery form and delete all signatures in `validated[]`
   */
  public editDelivery() {
    const delivery = this.query.getActive();
    this.db.doc<Delivery>(`deliveries/${delivery.id}`).set({ ...delivery, validated: [] });
    this.router.navigate([`layout/${this.movieQuery.getActiveId()}/form/${delivery.id}`]);
    //TODO: ask all stakeholders for permission to re-open the delivery form
    //TODO: secure this so we can't get there with raw url
  }

  /** Deletes delivery and all the sub-collections in firebase */
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

  /** Adds a stakeholder with specific authorization to the delivery */
  public addStakeholder(stakeholder: Stakeholder, authorization: string) {
    this.db
      .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${stakeholder.id}`)
      .set({ ...stakeholder, authorizations: [authorization] });
  }

  /** Returns true if number of signatures in validated equals number of stakeholders in delivery sub-collection */
  public isDeliveryValidated(): boolean {
    return this.query.getActive().validated.length === this.stakeholderQuery.getCount();
  }

  public subscribeOnDeliveryStakeholders() {
    return this.db
      .collection<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders`)
      .valueChanges()
      .pipe(
        switchMap(stakeholders =>
          combineLatest(
            stakeholders.map(stakeholder => {
              return this.stakeholderQuery.selectEntity(stakeholder.id);
            })
          )
        ),
        tap(stakeholders => this.store.update(this.query.getActiveId(), { stakeholders }))
      );
  }

  public subscribeOnActiveDelivery() {
    return this.query.selectActiveId().pipe(
      filter(id => !!id),
      switchMap(id => this.db.doc<Delivery>(`deliveries/${id}`).valueChanges()),
      tap(delivery => this.store.update(delivery.id, delivery))
    );
  }

  public signDelivery() {
    const orgIdsOfUser = this.organizationQuery.getAll().map(org => org.id);
    const stakeholders = this.query.getActive().stakeholders;
    const validated = [...this.query.getActive().validated];

    let stakeholderSignee: Stakeholder;
    stakeholders.map(stakeholder =>
      orgIdsOfUser.includes(stakeholder.orgId) ? (stakeholderSignee = stakeholder) : false
    );

    if (!validated.includes(stakeholderSignee.id)) {
      validated.push(stakeholderSignee.id);
      this.db
      .doc<Delivery>(`deliveries/${this.query.getActiveId()}`)
      .update({ validated });
    }
  }
}
