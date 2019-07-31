import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { AppDetails, AppDetailsWithStatus, OrganizationStatus } from './organization.model';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { FireQuery } from '@blockframes/utils';

const APPS_DETAILS: AppDetails[] = [
  {
    name: 'Media Financiers',
    logoSrc: 'http://graphouille.g.r.pic.centerblog.net/6c2aaddd.png',
    href: '/movie-financing',
    id: 'media_financiers'
  },
  {
    name: 'Stories and More',
    logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/8cc2960d.png',
    href: '/stories-and-more',
    id: 'stories'
  },
  {
    name: 'Media Delivering',
    logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/22f09c18.png',
    href: '/delivery',
    id: 'media_delivering'
  },
  {
    name: 'Bigger Boat',
    logoSrc: 'https://www.stickpng.com/assets/images/580b57fbd9996e24bc43bb8e.png',
    href: '/bigger-boat',
    id: 'media_financiers'
  }
];

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends Query<OrganizationState> {
  constructor(protected store: OrganizationStore, protected db: FireQuery) {
    super(store);
  }

  get orgId$(): Observable<string> {
    return this.select(state => state.org.id);
  }

  /**
   * Returns an Observable that describe the list
   * of application that are accessible to the current
   * organization.
   */
  get appsDetails$(): Observable<AppDetailsWithStatus[]> {
    return this.orgId$.pipe(
      map(orgId => this.db.collection('app-requests').doc(orgId)),
      switchMap(docRef => docRef.valueChanges()),
      map(appRequest => appRequest || {}), // default to an empty document if no requests happened done so fare
      map(appRequest =>
        APPS_DETAILS.map(app => ({
          ...app,
          status: (appRequest[app.id] as string) || 'none' // TODO: type
        }))
      )
    );
  }

  get status$(): Observable<OrganizationStatus> {
    return this.select(state => state.org).pipe(
      filter(org => !!org),
      map(org => org.status)
    );
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
