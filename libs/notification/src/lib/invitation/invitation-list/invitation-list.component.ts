import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import {
  InvitationQuery,
  InvitationService,
  Invitation,
  InvitationStore,
  InvitationType
} from '../+state';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state/permissions.query';
import { Order } from '@datorama/akita';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public docInvitations$: Observable<Invitation[]>;
  public userInvitations$: Observable<Invitation[]>;
  public isSuperAdmin$: Observable<boolean>;
  private sub: Subscription;

  constructor(
    private query: InvitationQuery,
    private store: InvitationStore,
    private service: InvitationService,
    private permissionQuery: PermissionsQuery,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    /**
     * Checks if the user is superAdmin before populating the invitations arrays. If so, we populate
     * both docInvitations and userInvitations. If not, we populate only docInvitations.
     */
    const storeName = this.store.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
    this.docInvitations$ = this.query.selectAll({
      filterBy: invitation => invitation.type === InvitationType.toWorkOnDocument,
      sortBy: 'date',
      sortByOrder: Order.DESC
    });

    this.isSuperAdmin$ = this.permissionQuery.isSuperAdmin$;

    this.userInvitations$ = this.permissionQuery.isSuperAdmin$.pipe(
      switchMap((isSuperAdmin) => {
        const filterBy = invitation => invitation.type === InvitationType.fromUserToOrganization;
        if (!isSuperAdmin) {
          const ids = this.query.getAll({ filterBy }).map(entity => entity.id);
          // TODO: Not working as intended as first value emitted is empty => ISSUE#1056
          this.store.remove(ids);
        }
        return this.query.selectAll({
          filterBy,
          sortBy: 'date',
          sortByOrder: Order.DESC
        });
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
