import { Injectable } from '@angular/core';
// tslint:disable-next-line
import { OrganizationQuery, Organization, OrganizationStore } from '@blockframes/organization';
import { switchMap, tap, filter, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { TemplateStore } from './template.store';
import { createTemplate, Template } from './template.model';
import { Material, MaterialQuery } from '../../material/+state';
import { TemplateQuery } from './template.query';
import { AuthQuery } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  public subscribeOnOrganizationTemplates$ = this.organizationQuery.selectActiveId().pipe(
    filter(id => !!id),
    switchMap(id => this.db.collection<Template>(`orgs/${id}/templates`).valueChanges()),
    tap(templates => this.store.set(templates))
  );

  // public get subscribeOnUserTemplates$() {
  //   const templatesByOrgs =  this.organizationQuery.getAll().map((org) =>
  //       this.db.collection<Template>(`orgs/${org.id}/templates`).valueChanges());

  //   return combineLatest(templatesByOrgs).pipe(
  //     tap(templates => templates.map(template => this.store.add(template)))
  //   );
  // }

  public get subscribeOnUserTemplates$() {
    const templatesByOrgs = this.organizationQuery.selectAll().pipe(
      switchMap(orgs =>
        combineLatest(
          orgs.map(org =>
            this.db
              .collection<Template>(`orgs/${org.id}/templates`)
              .valueChanges()
              .pipe(map(templates => ({ ...org, templates } as Organization)))
          )
        )
      )
    );

    return templatesByOrgs.pipe(
      switchMap(orgs => orgs.map(org => tap(this.organizationStore.update(org.id, org))))
    );
  }

  // public subscribeUserTemplates2() {
  //   return combineLatest(this.db
  //     .collection<Organization>('orgs', ref =>
  //       ref.where('userIds', 'array-contains', this.authQuery.user.uid)
  //     )
  //     .valueChanges()
  //     .pipe(

  //       switchMap(orgs => orgs),
  //       switchMap(org => this.db.collection<Template>(`orgs/${org.id}/templates`).valueChanges(),

  //       ),
  //       tap(templates => console.log(templates))
  //     )
  // }

  // public deliveriesInfoByMovie() {
  //   return combineLatest([
  //     this.selectAll(),
  //     this.movieQuery.selectActive()
  //   ]).pipe(
  //     map(([deliveries, movie]) => {
  //       return deliveries.map(delivery =>
  //         delivery = {...delivery,
  //                     ...{producer: this.userQuery.getUserEmail(delivery.productorId)},
  //                     ...{distributor: this.userQuery.getUserEmail(delivery.distributorId)},
  //                     ...{movieTitle: this.movieQuery.movieTitle(delivery.movieId)}
  //                    }
  //         ).filter(delivery => delivery.movieId === movie.id);
  //     })
  //   );
  // }

  // public subscribe(orgID: string): Observable<OrgMember[]> {
  //   const pullUserAndOrgRights = (userID): Observable<OrgMember> => (
  //     combineLatest([
  //       this.firestore.collection('users').doc(userID)
  //         .get()
  //         .pipe(map(x => x.data())),
  //       this.firestore.collection('users').doc(userID).collection('orgRights').doc(orgID)
  //         .get()
  //         .pipe(map(x => x.data()))
  //     ]).pipe(map(([user, rights]): OrgMember => ({
  //       id: user.uid,
  //       email: user.email,
  //       roles: rights.rightNameSlug
  //     })))
  //   );

  // public subscribeUserTemplates2() {
  //   return this.db
  //     .collection<Organization>('orgs', ref =>
  //       ref.where('userIds', 'array-contains', this.authQuery.user.uid)
  //     )
  //     .valueChanges()
  //     .pipe(
  //       switchMap(orgs => orgs),
  //       switchMap(org => this.db.collection<Template>(`orgs/${org.id}/templates`).valueChanges()),
  //       tap(templates => console.log(templates))
  //     );
  // }

  constructor(
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore,
    private store: TemplateStore,
    private query: TemplateQuery,
    private materialQuery: MaterialQuery,
    private authQuery: AuthQuery,
    private organizationStore: OrganizationStore
  ) {}

  public addTemplate(templateName: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const idTemplate = this.db.createId();
    const template = createTemplate({ id: idTemplate, name: templateName });
    this.db.doc<Template>(`orgs/${idOrg}/templates/${idTemplate}`).set(template);
  }

  public addUnamedTemplate() {
    const template = createTemplate({ id: this.db.createId() });
    this.store.update({ form: template });
    // this.store.add(template);
    // this.store.setActive(template.id);
  }

  public deleteTemplate(id: string) {
    const idOrg = this.organizationQuery.getActiveId();
    this.db.doc<Template>(`orgs/${idOrg}/templates/${id}`).delete();
  }

  public deleteMaterial(id: string) {
    const idOrg = this.organizationQuery.getActiveId();

    // delete material and materialId of materialsId of sub-collection template in firebase
    const template = this.query.getActive();
    const materialsId = [...template.materialsId];
    const index = materialsId.indexOf(id);
    materialsId.splice(index, 1);

    this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
    this.db.doc<Material>(`orgs/${idOrg}/materials/${id}`).delete();
  }

  public saveMaterial(material: Material) {
    // Add material to sub-collection materials of organization in firebase
    const idOrg = this.organizationQuery.getActiveId();
    const idMaterial = this.db.createId();
    this.db
      .doc<Material>(`orgs/${idOrg}/materials/${idMaterial}`)
      .set({ ...material, id: idMaterial });

    // Add materialId of materialsId of sub-collection template in firebase
    const template = this.query.getActive();
    const materialsId = [...template.materialsId, idMaterial];
    this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).update({ materialsId });
  }

  public async saveTemplate(name: string) {
    const idOrg = this.organizationQuery.getActiveId();
    const materials = this.materialQuery.getAll();
    if (materials.length > 0) {
      const template = createTemplate({id: this.db.createId(), name})
      template.materialsId = materials.map(({ id }) => id)
      this.db.doc<Template>(`orgs/${idOrg}/templates/${template.id}`).set(template);
      return Promise.all(
        materials.map(material =>
          this.db.doc<Material>(`orgs/${idOrg}/materials/${material.id}`).set(material)
        )
      );
    }
  }

  public async nameExists(name: string) {
    // check if name is already used in an already template
    return this.query.hasEntity(entity => entity.name === name);
  }
}
