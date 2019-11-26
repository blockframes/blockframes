import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PermissionsStore, PermissionsState } from './permissions.store';
import { Permissions } from './permissions.model';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from './permissions.firestore';

@Injectable({
  providedIn: 'root'
})
export class PermissionsQuery extends QueryEntity<PermissionsState, Permissions> {

    /** Checks if the connected user is superAdmin of his organization. */
    public isSuperAdmin$: Observable<boolean> = this.selectActive(permissions =>
      permissions.roles[this.auth.userId] === UserRole.superAdmin
    );

    /** Checks if the connected user is admin of his organization. */
    public isAdmin$: Observable<boolean> = this.isSuperAdmin$.pipe(
      map(isSuperAdmin => isSuperAdmin || this.getActive().roles[this.auth.userId] === UserRole.admin)
    );

    /** Checks if the connected user is either member of his organization. */
    public isOrgMember$: Observable<boolean> = this.isAdmin$.pipe(
      map(isAdmin => isAdmin || this.getActive().roles[this.auth.userId] === UserRole.member)
    );

  constructor(protected store: PermissionsStore, private auth: AuthQuery) {
    super(store);
  }

  /** Returns the number of organization admins. */
  public get superAdminCount(): number {
    return Object.values(this.getActive().roles).filter(value => value === UserRole.superAdmin).length;
  }

  /** Checks if the user is SuperAdmin of his organization. */
  public isUserAdmin(userId: string): boolean {
    return this.getActive().roles[userId] === UserRole.admin;
  }
}
