import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { MaterialQuery } from '../../material/+state/material.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery, Step, DeliveryDB } from './delivery.model';
import {
  MovieQuery,
  Stakeholder,
  StakeholderQuery,
  createDeliveryStakeholder,
  StakeholderService,
  StakeholderStore
} from '@blockframes/movie';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { TemplateQuery } from '../../template/+state';
import { switchMap, tap, map, takeWhile } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Query, FireQuery } from '@blockframes/utils';
import { Router } from '@angular/router';

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
    private db: AngularFirestore,
    private stakeholderService: StakeholderService,
    private stakeholderStore: StakeholderStore,
    private router: Router,
    private fireQuery: FireQuery
  ) {}

  ///////////////////
  // CRUD MATERIAL //
  ///////////////////

  /** Adds material to the delivery sub-collection in firebase */
  public saveMaterial(material: Material) {
    const idDelivery = this.query.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`deliveries/${idDelivery}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });
    this.db.doc<Delivery>(`deliveries/${idDelivery}`).update({ validated: [] });
  }

  /** Update material to the delivery sub-collection in firebase */
  public updateMaterial(material: Material) {
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${material.id}`).update(material);
    this.db.doc<Delivery>(`deliveries/${idDelivery}`).update({ validated: [] });
  }

  /** Deletes material of the delivery sub-collection in firebase */
  public deleteMaterial(id: string) {
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
    this.db.doc<Delivery>(`deliveries/${idDelivery}`).update({ validated: [] });
  }

  /** Changes material 'delivered' property value to true or false when triggered */
  public approvedToggle(material: Material, movieId: string) {
    return this.db
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ approved: !material.approved });
  }

  public updateMaterialState(materials: Material[], state: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const materialRef = this.db.doc<Material>(
        `movies/${this.movieQuery.getActiveId()}/materials/${material.id}`
      ).ref;
      return batch.update(materialRef, { state });
    });
    batch.commit();
  }

  ///////////////////
  // CRUD DELIVERY //
  ///////////////////

  /** Initializes a new delivery in firebase
   *
   * @param templateId if templateId is present, the materials sub-collection is populated with materials from this template
   */
  public addDelivery(templateId?: string) {
    const id = this.db.createId();
    const stakeholder = this.query.findActiveStakeholder();
    const movieId = this.movieQuery.getActiveId();
    const delivery = createDelivery({ id, movieId, validated: [] });
    const deliveryStakeholder = this.makeDeliveryStakeholder(
      stakeholder.id,
      stakeholder.orgId,
      ['canValidateDelivery'],
      true
    );

    this.db.doc<Delivery>(`deliveries/${id}`).set(delivery);
    this.db
      .doc<Stakeholder>(`deliveries/${id}/stakeholders/${deliveryStakeholder.id}`)
      .set(deliveryStakeholder);
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

  public async addMovieMaterialsDelivery() {
    const snapshot = await this.db
      .collection<Material>(`movies/${this.movieQuery.getActiveId()}/materials/`)
      .ref.get();
    const movieMaterials = snapshot.docs.map(doc => doc.data()) as Material[];

    const id = this.db.createId();
    const stakeholder = this.query.findActiveStakeholder();
    const movieId = this.movieQuery.getActiveId();
    const delivery = createDelivery({ id, movieId, validated: [] });
    const deliveryStakeholder = this.makeDeliveryStakeholder(
      stakeholder.id,
      stakeholder.orgId,
      ['canValidateDelivery'],
      true
    );

    this.db.doc<Delivery>(`deliveries/${id}`).set(delivery);
    this.db
      .doc<Stakeholder>(`deliveries/${id}/stakeholders/${deliveryStakeholder.id}`)
      .set(deliveryStakeholder);
    this.store.setActive(id);
    this.router.navigate([`layout/${this.movieQuery.getActiveId()}/form/${id}/settings`]);
    return Promise.all(
      movieMaterials.map(material =>
        this.db
          .doc<Material>(`deliveries/${id}/materials/${material.id}`)
          .set({
            id: material.id,
            value: material.value,
            description: material.description,
            category: material.category
          })
      )
    );
  }

  public updateDueDate(dueDate: Date) {
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ dueDate });
  }

  /** Add step in array steps of delivery */
  public createStep(step: Step) {
    step.id = this.db.createId();
    const steps = [...this.query.getActive().steps, step];
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ steps });
  }

  /** Update step in array steps of delivery */
  public updateStep(step: Step, form: Step) {
    const steps = [...this.query.getActive().steps];
    const index = steps.indexOf(step);
    steps.splice(index, 1, { ...step, ...form });
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ steps });
  }

  /** Remove step in array steps of delivery */
  public removeStep(step: Step) {
    const steps = [...this.query.getActive().steps];
    const index = steps.indexOf(step);
    steps.splice(index, 1);
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ steps });
  }

  /** Remove signatures in array validated of delivery */
  public unsealDelivery() {
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ validated: [] });
    //TODO: ask all stakeholders for permission to re-open the delivery form
  }

  /** Deletes delivery and all the sub-collections in firebase */
  public async deleteDelivery() {
    const id = this.query.getActiveId();

    this.db.doc<Delivery>(`deliveries/${id}`).delete();

    this.store.setActive(null);
  }

  /** Sign array validated of delivery with stakeholder logged */
  public signDelivery() {
    const orgIdsOfUser = this.organizationQuery.getAll().map(org => org.id);
    const { validated } = this.query.getActive();
    const stakeholders = this.stakeholderQuery.getAll();

    const stakeholderSignee = stakeholders.find(({ orgId }) => orgIdsOfUser.includes(orgId));

    if (!validated.includes(stakeholderSignee.id)) {
      const updatedValidated = [...validated, stakeholderSignee.id];
      this.db
        .doc<Delivery>(`deliveries/${this.query.getActiveId()}`)
        .update({ validated: updatedValidated });
    }
  }

  private makeDeliveryStakeholder(
    id: string,
    orgId: string,
    authorizations: string[],
    isAccepted: boolean
  ) {
    return createDeliveryStakeholder({ id, orgId, authorizations, isAccepted });
  }

  /** Add a stakeholder to the delivery */
  public addStakeholder(movieStakeholder: Stakeholder) {
    const deliveryStakeholder = this.stakeholderQuery
      .getAll()
      .find(stakeholder => stakeholder.id === movieStakeholder.id);
    // If deliveryStakeholder doesn't exist yet, we need to create him
    if (!deliveryStakeholder) {
      const authorizations = [];
      const newDeliveryStakeholder = this.makeDeliveryStakeholder(
        movieStakeholder.id,
        movieStakeholder.orgId,
        authorizations,
        false
      );
      this.db
        .doc<Stakeholder>(
          `deliveries/${this.query.getActiveId()}/stakeholders/${newDeliveryStakeholder.id}`
        )
        .set(newDeliveryStakeholder);
    }
  }

  /** Update authorizations of stakeholder delivery */
  public updateStakeholderAuthorizations(stakeholderId: string, authorizations: string[]) {
    this.db
      .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${stakeholderId}`)
      .update({ authorizations });
  }

  /** Delete stakeholder delivery */
  public removeStakeholder(stakeholderId: string) {
    this.db
      .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${stakeholderId}`)
      .delete();
  }

  /** Returns true if number of signatures in validated equals number of stakeholders in delivery sub-collection */
  public async isDeliveryValidated(): Promise<boolean> {
    const delivery = this.query.getActive();
    const stakeholders = await this.db
      .collection<Stakeholder>(`deliveries/${delivery.id}/stakeholders`)
      .get()
      .toPromise();
    return delivery.validated.length === stakeholders.size;
  }

  /** Returns stakeholders updated with stakeholders of the store stakeholders (movie-lib) */
  private updateDeliveryShWithMovieSh(stakeholders: Stakeholder[]) {
    const updatedSh$ = stakeholders.map(stakeholder =>
      this.db
        .doc<Stakeholder>(`movies/${this.movieQuery.getActiveId()}/stakeholders/${stakeholder.id}`)
        .valueChanges()
        .pipe(map(movieSh => ({ ...movieSh, ...stakeholder } as Stakeholder)))
    );
    return combineLatest(updatedSh$);
  }

  public get deliveryList() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(id => this.fireQuery.fromQuery(this.getDeliveryListWithStakeholders(id))),
      tap(deliveries => this.store.set(deliveries))
    );
  }

  private getDeliveryListWithStakeholders(movieId: string): Query<Delivery[]> {
    return {
      path: `deliveries`,
      queryFn: ref => ref.where('movieId', '==', movieId),
      stakeholders: (delivery: Delivery): Query<Stakeholder> => ({
        path: `deliveries/${delivery.id}/stakeholders`,
        organization: (stakeholder: Stakeholder): Query<Organization> => ({
          path: `orgs/${stakeholder.orgId}`
        })
      })
    };
  }

  ////////////////////////
  // START SUBSCRIPTION //
  ////////////////////////
  public suscribeOnDeliveriesByActiveMovie() {
    function modifyTimestampToDate(delivery: DeliveryDB): Delivery {
      return {
        ...delivery,
        dueDate: delivery.dueDate ? delivery.dueDate.toDate() : undefined,
        steps: delivery.steps.map(step => ({ ...step, date: step.date.toDate() }))
      };
    }
    return this.movieQuery.selectActiveId().pipe(
      switchMap(id =>
        this.db
          .collection<DeliveryDB>('deliveries', ref => ref.where('movieId', '==', id))
          .valueChanges()
      ),
      map(deliveries => deliveries.map(modifyTimestampToDate)),
      tap(deliveries => this.store.set(deliveries))
    );
  }

  /** Merge stakeholders of delivery with stakeholders of movie */
  public subscribeOnDeliveryStakeholders() {
    return this.db
      .collection<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders`)
      .valueChanges()
      .pipe(
        switchMap(deliverySh => this.stakeholderService.getAllStakeholdersWithOrg(deliverySh)),
        switchMap(deliveryShWithMovie => this.updateDeliveryShWithMovieSh(deliveryShWithMovie)),
        tap(updatedSh => this.stakeholderStore.set(updatedSh))
      );
  }
}
