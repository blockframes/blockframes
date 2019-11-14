import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  AppDetailsWithStatus,
  AppStatus,
  OrganizationStatus,
  Organization
} from './organization.model';
import { filter, map, switchMap } from 'rxjs/operators';
import { FireQuery, APPS_DETAILS } from '@blockframes/utils';
import { PermissionsQuery } from '../permissions/+state';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
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

  constructor(
    protected store: OrganizationStore,
    private permissionsQuery: PermissionsQuery,
    protected db: FireQuery
    ) {
    super(store);
  }

  public isAccepted$ = this.selectAll().pipe(
    filter(orgs => !!orgs[0]),
    map(orgs => orgs[0].status === OrganizationStatus.accepted)
  )

  get orgId$(): Observable<string> {
    return this.selectActive().pipe(map(org => org.id));
  }

  get id() {
    return this.getActiveId()
  }

  get pendingActions$() {
    return this.selectActive().pipe(
      map(org => org.actions),
      filter(actions => !!actions),
      map(actions => actions.filter(action => !action.isApproved))
    );
  }

  get approvedActions$() {
    return this.selectActive().pipe(
      map(org => org.actions),
      filter(actions => !!actions),
      map(actions => actions.filter(action => action.isApproved))
    );
  }

  getOperationById(id: string) {
    return this.getActive().operations.filter(action => action.id === id)[0];
  }
}
