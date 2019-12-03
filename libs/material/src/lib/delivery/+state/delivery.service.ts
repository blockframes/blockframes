import { Injectable } from '@angular/core';
import { DeliveryQuery } from './delivery.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery, DeliveryWithTimestamps, deliveryStatuses } from './delivery.model';
import {
  Movie,
  MovieQuery
} from '@blockframes/movie';
import { OrganizationQuery, PermissionsService} from '@blockframes/organization';
import { BFDoc } from '@blockframes/utils';
import { MaterialQuery, MaterialService, createMaterial } from '../../material/+state';
import { TemplateQuery } from '../../template/+state';
import { DeliveryOption, DeliveryWizard, DeliveryWizardKind, DeliveryState, DeliveryStore } from './delivery.store';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx } from '@blockframes/ethers';
import { TxFeedback } from '@blockframes/ethers/types';
import { StakeholderService } from '../stakeholder/+state/stakeholder.service';
import { CollectionService, CollectionConfig, Query, awaitSyncQuery } from 'akita-ng-fire';
import { tap, switchMap } from 'rxjs/operators';

interface AddDeliveryOptions {
  templateId?: string;
  movieId?: string;
  mustChargeMaterials?: boolean;
  mustBeSigned?: boolean;
}

// TODO: add a stakeholderIds in delivery so we can filter them here. => ISSUE#639
// e. g. queryFn: ref => ref.where('stakeholderIds', 'array-contains', userOrgId)
const deliveriesListQuery = (movieId: string): Query<DeliveryWithTimestamps[]> =>  ({
  path: 'deliveries',
  queryFn: ref => ref.where('movieId', '==', movieId),
  stakeholders: delivery => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: stakeholder => ({
      path: `orgs/${stakeholder.id}`
    })
  })
})

export const deliveryQuery = (deliveryId: string): Query<DeliveryWithTimestamps> => ({
  path: `deliveries/${deliveryId}`,
  stakeholders: delivery => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: stakeholder => ({
      path: `orgs/${stakeholder.id}`
    })
  })
});

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'deliveries' })
export class DeliveryService extends CollectionService<DeliveryState> {
  constructor(
    private movieQuery: MovieQuery,
    private templateQuery: TemplateQuery,
    private materialQuery: MaterialQuery,
    private materialService: MaterialService,
    private organizationQuery: OrganizationQuery,
    private query: DeliveryQuery,
    private permissionsService: PermissionsService,
    private shService: StakeholderService,
    private walletService: WalletService,
    protected store: DeliveryStore
  ) {
    super(store);
  }

  /** Sync the store with every deliveries of the active movie. */
  public syncDeliveriesListQuery() {
    return this.movieQuery.selectActiveId().pipe(
      // Reset the store everytime the movieId changes
      tap(_ => this.store.reset()),
      switchMap(movieId => awaitSyncQuery.call(this, deliveriesListQuery(movieId)))
    );
  }

  /** Sync the store with the given delivery. */
  public syncDeliveryQuery(deliveryId: string) {
    // Reset the store everytime the deliveryId changes
    this.store.reset();
    return awaitSyncQuery.call(this, deliveryQuery(deliveryId));
  }

  ///////////////////////////
  // Document manipulation //
  ///////////////////////////

  private movieDoc(movieId: string): AngularFirestoreDocument<Movie> {
    return this.db.doc<Movie>(`movies/${movieId}`);
  }

  private materialDeliveryDoc(deliveryId: string, materialId: string): AngularFirestoreDocument {
    return this.deliveryDoc(deliveryId).collection('materials').doc(materialId);
  }

  private deliveryDoc(deliveryId: string): AngularFirestoreDocument<DeliveryWithTimestamps> {
    return this.db.doc(`deliveries/${deliveryId}`);
  }

  ///////////////////
  // CRUD DELIVERY //
  ///////////////////

  public updateDeliveryStatus(index: number): Promise<any> {
    return this.update(this.query.getActiveId(), { status: deliveryStatuses[index] });
  }

  public updateCurrentMGDeadline(index: number): Promise<any> {
    return this.update(this.query.getActiveId(), { mgCurrentDeadline: index });
  }

  /** Initializes a new delivery in firebase
   *
   * @param opts if templateId is present, the materials sub-collection is populated with materials from this template
   */
  public async addDelivery(opts: AddDeliveryOptions) {
    const id = this.db.createId();
    const organization = this.organizationQuery.getActive();
    const movieId = opts.movieId || this.movieQuery.getActiveId();
    const movieRef = this.movieDoc(movieId).ref;

    const delivery = createDelivery({
      id,
      movieId,
      validated: [],
      mustChargeMaterials: opts.mustChargeMaterials,
      mustBeSigned: opts.mustBeSigned
    });

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const movieSnap = await tx.get(movieRef);
      const deliveryIds = movieSnap.data().deliveryIds || [];

      // Create document and permissions
      await this.permissionsService.createDocAndPermissions(delivery, organization, tx);

      // If there is a templateId, and mustBeSigned is true, copy template materials to the delivery
      if (!!opts.templateId && delivery.mustBeSigned) {
        const template = this.templateQuery.getEntity(opts.templateId);
        await this.copyMaterialsInDelivery(delivery, template, tx);
      }

      // If there is a templateId, and mustBeSigned is false, copy template materials to the movie
      if (!!opts.templateId && !delivery.mustBeSigned) {
        const template = this.templateQuery.getEntity(opts.templateId);
        await this.copyMaterialsInMovie(delivery, template, tx);
      }

      // Create the stakeholder in the sub-collection
      await this.shService.addStakeholder(delivery.id, organization.id, true, tx);

      // Update the movie deliveryIds
      const nextDeliveryIds = [...deliveryIds, delivery.id];
      tx.update(movieRef, { deliveryIds: nextDeliveryIds });
    });

    return id;
  }

  /** Add a new delivery by copying the movie's materials */
  public async addDeliveryWithMovieMaterials(opts?: AddDeliveryOptions) {
    const id = this.db.createId();
    const movieId = this.movieQuery.getActiveId();
    const organization = this.organizationQuery.getActive();
    const movieRef = this.movieDoc(movieId).ref;

    const delivery = createDelivery({
      id,
      movieId,
      validated: [],
      mustChargeMaterials: opts.mustChargeMaterials,
      mustBeSigned: opts.mustBeSigned
    });

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const movieSnap = await tx.get(movieRef);
      const deliveryIds = movieSnap.data().deliveryIds || [];

      // Create document and permissions
      await this.permissionsService.createDocAndPermissions(delivery, organization, tx);

      // If mustBeSigned is true, copy materials to the delivery
      if (delivery.mustBeSigned) {
        await this.copyMaterialsInDelivery(delivery, movieSnap.data() as Movie, tx);
      }

      // If mustBeSigned is false, add deliveryId in deliveryIds of each material
      if (!delivery.mustBeSigned) {
        await this.pushDeliveryId(delivery.id, movieSnap.data() as Movie, tx);
      }

      // Create the stakeholder in the sub-collection
      await this.shService.addStakeholder(delivery.id, organization.id, true, tx);

      // Update the movie deliveryIds
      const nextDeliveryIds = [...deliveryIds, delivery.id];
      tx.update(movieRef, { deliveryIds: nextDeliveryIds });
    });

    return id;
  }

  /** Add a delivery using all the settings picked in the creation tunnel */
  public async addDeliveryFromWizard(wizard: DeliveryWizard, movieId: string, templateId: string) {
    const mustBeSigned = wizard.options.includes(DeliveryOption.mustBeSigned);
    const mustChargeMaterials = wizard.options.includes(DeliveryOption.mustChargeMaterials);

    const opts: AddDeliveryOptions = {
      movieId,
      mustChargeMaterials,
      mustBeSigned
    };

    switch (wizard.kind) {
      case DeliveryWizardKind.useTemplate:
        opts.templateId = templateId;
        return this.addDelivery(opts);
      case DeliveryWizardKind.specificDeliveryList:
        return this.addDelivery(opts);
      case DeliveryWizardKind.blankList:
        return this.addDelivery(opts);
      case DeliveryWizardKind.materialList:
        return this.addDeliveryWithMovieMaterials(opts);
    }
  }

  /** Update informations of delivery */
  public async updateInformations(delivery: Partial<Delivery>) {
    const oldSteps = this.query.getActive().steps;
    const { mustBeSigned, id } = this.query.getActive();

    // Add an id for new steps
    const stepsWithId = delivery.steps.map(step => (step.id ? step : { ...step, id: this.db.createId() }));

    // Find steps that need to be removed
    const deletedSteps = oldSteps.filter(
      oldStep => !stepsWithId.some(newStep => newStep.id === oldStep.id)
    );

    // We set the concerned materials stepId to an empty string
    deletedSteps.forEach(step => {
      const materials = this.materialQuery.getAll().filter(material => material.stepId === step.id);
      // If the delivery is mustBeSigned, we update stepId of materials in the sub-collection of delivery
      if (mustBeSigned) {
        this.materialService.removeStepIdDeliveryMaterials(materials, id);
      // Else, we update stepId of materials in the sub-collection of movie
      } else {
        const materialsWithoutStep = materials.map(material => ({ ...material, stepId: ''}));
        this.materialService.updateMovieMaterials(materialsWithoutStep, this.movieQuery.getActiveId());
      }
    })

    return this.update(id, {
      // Update minimum guaranteed informations of delivery
      mgAmount: delivery.mgAmount,
      mgCurrency: delivery.mgCurrency,
      mgDeadlines: delivery.mgDeadlines,

      // Update dates of delivery
      dueDate: delivery.dueDate,
      acceptationPeriod: delivery.acceptationPeriod,
      reWorkingPeriod: delivery.reWorkingPeriod,

      // Update steps of delivery
      steps: stepsWithId
    });
  }

  /** Remove signatures in array validated of delivery */
  public unsealDelivery(): Promise<void> {
    // TODO(issue#775): ask all stakeholders for permission to re-open the delivery form
    return this.update(this.query.getActiveId(), { validated: [], isSigned: false });
  }

  /** Deletes delivery and all the sub-collections in firebase */
  public async deleteDelivery(): Promise<any> {
    return this.remove(this.query.getActiveId());
  }

  /** Push stakeholder id into validated array as a signature */
  public signDelivery(deliveryId?: string): Promise<any> {
    let delivery: Delivery;

    if (!!deliveryId) {
      delivery = this.query.getEntity(deliveryId);
    } else {
      delivery = this.query.getActive();
    }

    const organizationId = this.organizationQuery.getActiveId();
    const { id, validated, stakeholders } = delivery;

    const stakeholderSignee = stakeholders.find(
      ({ id: stakeholderId }) => organizationId === stakeholderId
    );

    if (!validated.includes(stakeholderSignee.id)) {
      const updatedValidated = [...validated, stakeholderSignee.id];
      return this.update(id, { validated: updatedValidated });
    }
  }

  /** Sign the delivery and save this action into active organization logs */
  public setSignDeliveryTx(orgEthAddress: string, deliveryId: string, deliveryHash: string, movieId: string) {
    const name = `Delivery #${deliveryId}`; // TODO better delivery name (see with @ioaNikas)
    const callback = async () => {
      await Promise.all([
        this.db
          .collection('actions')
          .doc(deliveryHash)
          .set({ name }),
        this.signDelivery(deliveryId)
      ]);
    };
    const feedback: TxFeedback = {
      confirmation: `You are about to sign the delivery ${name}`,
      success: `The delivery has been successfully signed !`,
      redirectName: 'Back to Delivery',
      redirectRoute: `/layout/o/delivery/${movieId}/${deliveryId}/informations`,
    }
    this.walletService.setTx(CreateTx.approveDelivery(orgEthAddress, deliveryHash, callback));
    this.walletService.setTxFeedback(feedback);
  }

  /** Create a transaction to copy the template/movie materials into the delivery materials */
  public async copyMaterialsInDelivery(
    delivery: Delivery,
    document: BFDoc,
    tx: firebase.firestore.Transaction
  ) {
    const materials = await this.materialService.getTemplateMaterials(document.id)

    materials.forEach(material => {
      tx.set(this.materialDeliveryDoc(delivery.id, material.id).ref, {
        ...material,
        state: '',
        deliveryIds: null,
        stepId: ''
      });
    });

    return tx;
  }

  /** Add a new deliveryId in each materials of a movie */
  public async pushDeliveryId(
    deliveryId: string,
    document: BFDoc,
    tx: firebase.firestore.Transaction
  ) {
    const materials = await this.materialService.getMovieMaterials(document.id);

    materials.forEach(material => {
      const targetRef = this.db.doc<Material>(`movies/${document.id}/materials/${material.id}`).ref;
      tx.update(targetRef, { deliveryIds: [...material.deliveryIds, deliveryId] });
    });

    return tx;
  }

  /** Copy the template materials into the movie materials */
  public async copyMaterialsInMovie(
    delivery: Delivery,
    document: BFDoc,
    tx: firebase.firestore.Transaction
  ) {
    // NOTE: There is no way to query a collection within the transaction
    // So we accept a race condition here
    const materials = await this.materialService.getTemplateMaterials(document.id);

    const movieMaterials = await this.materialService.getMovieMaterials(delivery.movieId);

    materials.forEach(material => {
      const sameValuesMaterial = movieMaterials.find(movieMaterial => this.materialService.isTheSame(movieMaterial, material));
      const isNewMaterial = !movieMaterials.find(movieMaterial => movieMaterial.id === material.id) && !sameValuesMaterial;

      // We check if material is brand new. If so, we just add it to database and return.
      if (isNewMaterial) {
        this.materialService.setNewMaterial(material, delivery);
        return;
      }

      // If there already is a material with same properties (but different id), we merge this
      // material with existing one, and push the new deliveryId into deliveryIds.
      if (!!sameValuesMaterial) {
        this.materialService.updateMaterialDeliveryIds(sameValuesMaterial, delivery);
      }

      // If values are not the same, this material is considered as new and we have to create
      // and set a new material (with new Id).
      if (!sameValuesMaterial) {
        const newMaterial = createMaterial({...material, id: this.db.createId()});
        this.materialService.setNewMaterial(newMaterial, delivery);
      }
    });
    return tx;
  }
}
