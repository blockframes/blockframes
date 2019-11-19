import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import {
  OrganizationStatus,
  Organization,
  AppDetailsWithStatus,
  AppStatus
} from './organization.model';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FireQuery, APPS_DETAILS } from '@blockframes/utils';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(
    protected store: OrganizationStore,
    private db: FireQuery
    ) {
    super(store);
  }

  /**
   * an Observable that describe the list
   * of application that are accessible to the current
   * organization.
  */
  public appsDetails$: Observable<AppDetailsWithStatus[]> = this.selectActiveId().pipe(
    map(orgId => this.db.collection('app-requests').doc(orgId)),
    switchMap(docRef => docRef.valueChanges()),
    map((appRequest = {}) =>
      APPS_DETAILS.map(app => ({
        ...app,
        status: (appRequest[app.id] as AppStatus) || AppStatus.none
      }))
    )
  );

  public isAccepted$ = this.selectActive().pipe(
    filter(org => !!org),
    map(org => org.status === OrganizationStatus.accepted)
  )

  public pendingActions$ = this.selectActive(org => org.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => !action.isApproved))
  );


  public approvedActions$ =  this.selectActive(org => org.actions).pipe(
    filter(actions => !!actions),
    map(actions => actions.filter(action => action.isApproved))
  );


  public getOperationById(id: string) {
    return this.getActive().operations.find(action => action.id === id);
  }
}
