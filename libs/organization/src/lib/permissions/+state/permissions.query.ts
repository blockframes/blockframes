import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PermissionsStore, PermissionsState } from './permissions.store';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionsQuery extends Query<PermissionsState> {
  /** Return an array containing the userIds of the superAdmins of the organization */
  public superAdmins$: Observable<string[]> = this.select(state => state.superAdmins);

  constructor(protected store: PermissionsStore, private auth: AuthQuery) {
    super(store);
  }

  /** Checks if the connected user is SuperAdmin of his organization */
  public get isSuperAdmin$(): Observable<boolean> {
    return this.select(state => state.superAdmins.includes(this.auth.userId));
  }

  /** Checks if the connected user is either SuperAdmin or Admin of his organization */
  public get isOrgAdmin$(): Observable<boolean> {
    return this.isSuperAdmin$.pipe(
      map(isSuperAdmin => isSuperAdmin || this.getValue().admins.includes(this.auth.userId))
    );
  }

  /** Checks if the user is SuperAdmin of his organization */
  public isUserSuperAdmin(userId: string): Observable<boolean> {
    return this.select(state => state.superAdmins.includes(userId));
  }
}
