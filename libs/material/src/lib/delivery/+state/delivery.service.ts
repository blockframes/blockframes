import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DeliveryStore } from './delivery.store';
import { DeliveryQuery } from './delivery.query';
import { MaterialQuery } from '../../material/+state/material.query';
import { Material } from '../../material/+state/material.model';
import { createDelivery, Delivery } from './delivery.model';
import {
  MovieQuery,
  Stakeholder,
  StakeholderQuery,
  createDeliveryStakeholder,
  StakeholderService,
  StakeholderStore,
  MovieStore,
  Movie
} from '@blockframes/movie';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { TemplateQuery } from '../../template/+state';
import { switchMap, tap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Query, FireQuery } from '@blockframes/utils';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private movieQuery: MovieQuery,
    private movieStore: MovieStore,
    private organizationQuery: OrganizationQuery,
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private store: DeliveryStore,
    private templateQuery: TemplateQuery,
    private stakeholderQuery: StakeholderQuery,
    private db: AngularFirestore,
    private stakeholderService: StakeholderService,
    private stakeholderStore: StakeholderStore,
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

  /** Deletes material of the delivery sub-collection in firebase */
  public deleteMaterial(id: string) {
    const idDelivery = this.query.getActiveId();
    this.db.doc<Material>(`deliveries/${idDelivery}/materials/${id}`).delete();
    this.db.doc<Delivery>(`deliveries/${idDelivery}`).update({ validated: [] });
  }

  /** Changes material 'delivered' property value to true or false when triggered */
  public deliveredToggle(material: Material, movieId: string) {
    return this.db
      .doc<Material>(`movies/${movieId}/materials/${material.id}`)
      .update({ delivered: !material.delivered });
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
    const deliveryStakeholder = this.makeDeliveryStakeholder(stakeholder.id, stakeholder.orgId, [
      'canValidateDelivery'
    ]);

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

  /** Remove signatures in array validated of delivery */
  public unsealDelivery() {
    this.db.doc<Delivery>(`deliveries/${this.query.getActiveId()}`).update({ validated: [] });
    //TODO: ask all stakeholders for permission to re-open the delivery form
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

  private makeDeliveryStakeholder(id: string, orgId: string, authorizations: string[]) {
    return createDeliveryStakeholder({ id, orgId, authorizations });
  }

  /** Update or Add a stakeholder with specific authorization to the delivery */
  public addStakeholder(movieStakeholder: Stakeholder, authorization: string) {
    const deliveryStakeholder = this.stakeholderQuery
      .getAll()
      .find(stakeholder => stakeholder.id === movieStakeholder.id);
    // If deliveryStakeholder doesn't exist yet, we need to create him
    if (!deliveryStakeholder) {
      const newDeliveryStakeholder = this.makeDeliveryStakeholder(
        movieStakeholder.id,
        movieStakeholder.orgId,
        [authorization]
      );
      this.db
        .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${newDeliveryStakeholder.id}`)
        .set(newDeliveryStakeholder);
      // If deliveryStakeholder exists, we update his authorizations
    } else {
      const authorizations = deliveryStakeholder.authorizations.includes(authorization)
        ? deliveryStakeholder.authorizations
        : [...deliveryStakeholder.authorizations, authorization];
      this.db
        .doc<Stakeholder>(`deliveries/${this.query.getActiveId()}/stakeholders/${deliveryStakeholder.id}`)
        .update({ authorizations });
    }
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
    return this.movieQuery
      .selectActiveId()
      .pipe(
        switchMap(id => this.fireQuery.fromQuery(this.getDeliveryListWithStakeholders(id))),
        tap((deliveries : any) => this.store.set(deliveries)));
  }

  private getDeliveryListWithStakeholders(movieId: string): Query<Delivery> {
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

  public get materialsList() {
    return this.movieQuery
      .selectActiveId()
      .pipe(
        switchMap(id => this.fireQuery.fromQuery(this.getMovieMaterialsList(id))),
        tap((movie : any) => this.movieStore.set(movie)));
  }

  private getMovieMaterialsList(movieId: string): Query<Movie> {
    return {
      path: `movies`,
      materials: (): Query<Material> => ({
        path: `movies/${movieId}/materials`
      })
    }
  }

  ////////////////////////
  // START SUBSCRIPTION //
  ////////////////////////

  public suscribeOnDeliveriesByActiveMovie() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(id =>
        this.db
          .collection<Delivery>('deliveries', ref => ref.where('movieId', '==', id))
          .valueChanges()
      ),
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
