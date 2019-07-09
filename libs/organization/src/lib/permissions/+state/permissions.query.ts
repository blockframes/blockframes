import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PermissionsStore, PermissionsState } from './permissions.store';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsQuery extends Query<PermissionsState> {
  constructor(protected store: PermissionsStore, private auth: AuthQuery) {
    super(store);
  }

  /** Checks if the connected user is SuperAdmin of his organization */
  public get isSuperAdmin$(): Observable<boolean> {
    return this.select(state => state.superAdmins.includes(this.auth.userId));
  }

  public get isOrgAdmin$(): Observable<boolean> {
    return this.isSuperAdmin$ || this.select(state => state.admins.includes(this.auth.userId));
  }

  /** Checks if the user is SuperAdmin of his organization */
  public isUserSuperAdmin(userId: string): Observable<boolean> {
    return this.select(state => state.superAdmins.includes(userId));
  }
}
