import { Injectable } from '@angular/core';
import { DeliveryQuery } from './delivery.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery, Step, DeliveryDB } from './delivery.model';
import {
  MovieQuery,
  Stakeholder,
  createDeliveryStakeholder,
  StakeholderService,
} from '@blockframes/movie';
import { OrganizationQuery, PermissionsService } from '@blockframes/organization';
import { FireQuery, BFDoc } from '@blockframes/utils';
import { MaterialQuery, createMaterial } from '../../material/+state';
import { TemplateQuery } from '../../template/+state';
import { filter } from 'rxjs/operators';

/** Takes a DeliveryDB (dates in Timestamp) and returns a Delivery with dates in type Date */
export function modifyTimestampToDate(delivery: DeliveryDB): Delivery {
  return {
    ...delivery,
    dueDate: delivery.dueDate ? delivery.dueDate.toDate() : undefined,
    steps: delivery.steps.map(step => ({ ...step, date: step.date.toDate() }))
  };
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private movieQuery: MovieQuery,
    private templateQuery: TemplateQuery,
    private materialQuery: MaterialQuery,
    private organizationQuery: OrganizationQuery,
    private query: DeliveryQuery,
    private permissionsService: PermissionsService,
    private shService: StakeholderService,
    private db: FireQuery
  ) {}

  ///////////////////
  // CRUD MATERIAL //
  ///////////////////

  /** Adds an empty material to the delivery sub-collection in firebase */
  public addMaterial(): string {
    const deliveryId = this.query.getActiveId();
    const materialId = this.db.createId();
    const materialRef = this.db.doc<Material>(`deliveries/${deliveryId}/materials/${materialId}`).ref;
    const deliveryRef = this.db.doc<Delivery>(`deliveries/${deliveryId}`).ref;

    this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const newMaterial = createMaterial({ id: materialId });
      tx.set(materialRef, newMaterial);
      tx.update(deliveryRef, { validated: [] });
    });

    return materialId;
  }

  /** Update materials of a delivery */
  public async updateMaterials(materials: Material[], deliveryId: string) {
    return this.db.firestore.runTransaction(async tx => {
      materials.forEach(material => {
        const materialRef = this.db.doc<Material>(`deliveries/${deliveryId}/materials/${material.id}`).ref;
        return tx.update(materialRef, material)
      });
    });
  }

  /** Deletes material of the delivery sub-collection in firebase */
  public deleteMaterial(materialId: string, deliveryId: string) {
    const materialRef = this.db.doc<Material>(`deliveries/${deliveryId}/materials/${materialId}`).ref;
    const deliveryRef = this.db.doc<Delivery>(`deliveries/${deliveryId}`).ref;

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      tx.delete(materialRef);
      tx.update(deliveryRef, { validated: [] });
    });
  }

  /** Changes material 'delivered' property value to true or false when triggered */
  public toggleApproved(materialId: string, approved: boolean) {
    const movieId = this.movieQuery.getActiveId();
    return this.db.doc<Material>(`movies/${movieId}/materials/${materialId}`).update({ approved });
  }

  /** Update the property state of movie's materials */
  public updateMaterialState(materials: Material[], state: string) {
    const batch = this.db.firestore.batch();
    materials.forEach(material => {
      const movieId = this.movieQuery.getActiveId();
      const doc = this.db.doc(`movies/${movieId}/materials/${material.id}`);
      return batch.update(doc.ref, { state });
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
  public async addDelivery(templateId?: string) {
    const id = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const movieId = this.movieQuery.getActiveId();
    const movieDoc = this.db.doc(`movies/${movieId}`);
    const delivery = createDelivery({ id, movieId, validated: [] });

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const movieSnap = await tx.get(movieDoc.ref);
      const deliveryIds = movieSnap.data().deliveryIds || [];

      // Create document and permissions
      await this.permissionsService.createDocAndPermissions(delivery, organization, tx);

      // If there is a templateId, copy template materials to the delivery
      if (!!templateId) {
        const template = this.templateQuery.getEntity(templateId);
        this.copyMaterials(delivery, template);
      }

      // Create the stakeholder in the sub-collection
      await this.shService.addStakeholder(delivery, organization.id, true, tx);

      // Update the movie deliveryIds
      const nextDeliveryIds = [...deliveryIds, delivery.id];
      tx.update(movieDoc.ref, { deliveryIds: nextDeliveryIds });
    });

    return id;
  }

  /** Add a new delivery by copying the movie's materials */
  public async addDeliveryWithMovieMaterials() {
    const id = this.db.createId();
    const movie = this.movieQuery.getActive();
    const movieDoc = this.db.doc(`movies/${movie.id}`);
    const organization = this.organizationQuery.getValue().org;
    const delivery = createDelivery({ id, movieId: movie.id, validated: [] });

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const movieSnap = await tx.get(movieDoc.ref);
      const deliveryIds = movieSnap.data().deliveryIds || [];

      // Create document and permissions
      await this.permissionsService.createDocAndPermissions(delivery, organization, tx);

      // Copy movie materials to the delivery
      this.copyMaterials(delivery, movie);

      // Create the stakeholder in the sub-collection
      await this.shService.addStakeholder(delivery, organization.id, true, tx);

      // Update the movie deliveryIds
      const nextDeliveryIds = [...deliveryIds, delivery.id];
      tx.update(movieDoc.ref, { deliveryIds: nextDeliveryIds });
    });

    return id;
  }

  public async updateDates(delivery : Partial<Delivery>) {
    const deliveryId = this.query.getActiveId();
    return this.db.doc<Delivery>(`deliveries/${deliveryId}`).update({
      dueDate: delivery.dueDate,
      acceptationPeriod: delivery.acceptationPeriod,
      reWorkingPeriod: delivery.reWorkingPeriod
    });
  }

  /** Add step in array steps of delivery */
  public createStep(step: Step) {
    const delivery = this.query.getActive();
    step.id = this.db.createId();
    const steps = [...delivery.steps, step];
    this.db.doc<Delivery>(`deliveries/${delivery.id}`).update({ steps });
  }

  /** Update step in array steps of delivery */
  public updateStep(step: Step, form: Step) {
    const delivery = this.query.getActive();
    const steps = [...delivery.steps];
    const index = steps.indexOf(step);
    steps.splice(index, 1, { ...step, ...form });
    this.db.doc<Delivery>(`deliveries/${delivery.id}`).update({ steps });
  }

  /** Remove step in array steps of delivery */
  public removeStep(step: Step) {
    const delivery = this.query.getActive();
    const steps = [...delivery.steps];
    const index = steps.indexOf(step);
    steps.splice(index, 1);
    this.db.doc<Delivery>(`deliveries/${delivery.id}`).update({ steps });

    // We also set the concerned materials .step to an empty string
    const batch = this.db.firestore.batch();
    const materials = this.materialQuery.getAll().filter(material => material.stepId === step.id);
    materials.forEach(material => {
      const doc = this.db.doc(`deliveries/${delivery.id}/materials/${material.id}`);
      return batch.update(doc.ref, { step: '' });
    });
    batch.commit();
  }

  /** Remove signatures in array validated of delivery */
  public unsealDelivery() {
    const id = this.query.getActiveId();
    this.db.doc<Delivery>(`deliveries/${id}`).update({ validated: [] });
    //TODO: ask all stakeholders for permission to re-open the delivery form
  }

  /** Deletes delivery and all the sub-collections in firebase */
  public async deleteDelivery() {
    const delivery = this.query.getActive();
    this.db.doc<Delivery>(`deliveries/${delivery.id}`).delete();
  }

  /** Sign array validated of delivery with stakeholder logged */
  public signDelivery() {
    const delivery = this.query.getActive();
    const organizationId = this.organizationQuery.getValue().org.id;
    const { validated } = delivery;
    const { stakeholders } = delivery;

    const stakeholderSignee = stakeholders.find(({ id }) => organizationId === id);

    if (!validated.includes(stakeholderSignee.id)) {
      const updatedValidated = [...validated, stakeholderSignee.id];
      this.db.doc<Delivery>(`deliveries/${delivery.id}`).update({ validated: updatedValidated });
    }
  }

  /** Create a transaction to copy the template/movie materials into the delivery materials */
  public async copyMaterials(delivery: Delivery, document: BFDoc) {
    const materials = await this.db.snapshot<Material[]>(
      `${document._type}/${document.id}/materials`
    );

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const promises = materials.map(material => {
        const materialRef = this.db.doc<Material>(
          `deliveries/${delivery.id}/materials/${material.id}`
        ).ref;
        return tx.set(materialRef, { ...material, state: '', stepId: '' });
      });

      return Promise.all(promises);
    });
  }

  ////////////////////////
  // CRUD STAKEHOLDERS //
  //////////////////////

  private makeDeliveryStakeholder(id: string, authorizations: string[], isAccepted: boolean) {
    return createDeliveryStakeholder({ id, authorizations, isAccepted });
  }

  /** Add a stakeholder to the delivery */
  public addStakeholder(movieStakeholder: Stakeholder) {
    const delivery = this.query.getActive();
    const deliveryStakeholder = delivery.stakeholders.find(
      stakeholder => stakeholder.id === movieStakeholder.id
    );
    // If deliveryStakeholder doesn't exist yet, we need to create him
    if (!deliveryStakeholder) {
      const authorizations = [];
      const newDeliveryStakeholder = this.makeDeliveryStakeholder(
        movieStakeholder.id,
        authorizations,
        false
      );
      this.db
        .doc<Stakeholder>(`deliveries/${delivery.id}/stakeholders/${newDeliveryStakeholder.id}`)
        .set(newDeliveryStakeholder);
    }
  }

  /** Update authorizations of stakeholder delivery */
  public updateStakeholderAuthorizations(stakeholderId: string, authorizations: string[]) {
    const deliveryId = this.query.getActiveId();
    this.db
      .doc<Stakeholder>(`deliveries/${deliveryId}/stakeholders/${stakeholderId}`)
      .update({ authorizations });
  }

  /** Delete stakeholder delivery */
  public removeStakeholder(stakeholderId: string) {
    const deliveryId = this.query.getActiveId();
    this.db.doc<Stakeholder>(`deliveries/${deliveryId}/stakeholders/${stakeholderId}`).delete();
  }

  /** Returns true if number of signatures in validated equals number of stakeholders in delivery sub-collection */
  public async isDeliveryValidated(deliveryId: string): Promise<boolean> {
    const delivery = this.query.getEntity(deliveryId);
    const stakeholders = await this.db
      .collection<Stakeholder>(`deliveries/${delivery.id}/stakeholders`)
      .get()
      .toPromise();
    return delivery.validated.length === stakeholders.size;
  }
}
