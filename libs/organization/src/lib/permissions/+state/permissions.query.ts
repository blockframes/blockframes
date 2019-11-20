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

    /** Checks if the connected user is superAdmin of his organization. */
    public isSuperAdmin$: Observable<boolean> = this.select(state =>
      state.superAdmins.includes(this.auth.userId)
    );

    /** Checks if the connected user is admin of his organization. */
    public isAdmin$: Observable<boolean> = this.isSuperAdmin$.pipe(
      map(isSuperAdmin => isSuperAdmin || this.getValue().admins.includes(this.auth.userId))
    );

    /** Checks if the connected user is either member of his organization. */
    public isOrgMember$: Observable<boolean> = this.isAdmin$.pipe(
      map(isAdmin => isAdmin || this.getValue().members.includes(this.auth.userId))
    );

  constructor(protected store: PermissionsStore, private auth: AuthQuery) {
    super(store);
  }

  /** Returns the number of organization admins. */
  public get superAdminCount(): number {
    return this.getValue().superAdmins.length;
  }

  /** Checks if the user is SuperAdmin of his organization. */
  public isUserAdmin(userId: string): boolean {
    return this.getValue().admins.includes(userId);
  }
}
