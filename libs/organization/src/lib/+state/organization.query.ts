import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  AppDetails,
  AppDetailsWithStatus,
  AppStatus,
  OrganizationStatus
} from './organization.model';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { FireQuery } from '@blockframes/utils';
import { App } from '../permissions/+state';
import { PermissionsQuery } from '../permissions/+state';

const APPS_DETAILS: AppDetails[] = [
  {
    name: 'Media Financiers',
    logo: 'http://graphouille.g.r.pic.centerblog.net/6c2aaddd.png',
    href: '/movie-financing',
    id: App.mediaFinanciers
  },
  {
    name: 'Stories and More',
    logo: 'http://recueil-de-png.r.e.pic.centerblog.net/8cc2960d.png',
    href: '/stories-and-more',
    id: App.storiesAndMore
  },
  {
    name: 'Media Delivering',
    logo: 'http://recueil-de-png.r.e.pic.centerblog.net/22f09c18.png',
    href: '/delivery',
    id: App.mediaDelivering
  }
];

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends Query<OrganizationState> {
  /**
   * an Observable that describe the list
   * of application that are accessible to the current
   * organization.
   */
  public appsDetails$: Observable<AppDetailsWithStatus[]> = this.orgId$.pipe(
    map(orgId => this.db.collection('app-requests').doc(orgId)),
    switchMap(docRef => docRef.valueChanges()),
    map((appRequest = {}) =>
      APPS_DETAILS.map(app => ({
        ...app,
        status: (appRequest[app.id] as AppStatus) || AppStatus.none
      }))
    )
  );

  constructor(protected store: OrganizationStore, private permissionsQuery: PermissionsQuery) {
    super(store);
  }

  get orgId$(): Observable<string> {
    return this.select(state => state.org.id);
  }

  public members$ = this.select(state => state.org.members).pipe(
    map(members => {
      const members2 = members.map(member => {
        let roles = [];
        this.permissionsQuery.isUserSuperAdmin(member.uid) ? roles = ['admin'] : roles = ['member'];
        return { ...member, roles };
      });
      return members2;
    })
  );

  get status$(): Observable<OrganizationStatus> {
    return this.select(state => state.org).pipe(
      filter(org => !!org),
      map(org => org.status)
    );
  }

  get id() {
    return this.getValue().org.id;
  }

  get form$() {
    return this.select(state => state.form);
  }

  get pendingActions$() {
    return this.select(state => state.org.actions.filter(action => !action.isApproved));
  }

  get approvedActions$() {
    return this.select(state => state.org.actions.filter(action => !action.isApproved));
  }

  getOperationById(id: string) {
    return this.getValue().org.operations.filter(action => action.id === id)[0];
  }
}
