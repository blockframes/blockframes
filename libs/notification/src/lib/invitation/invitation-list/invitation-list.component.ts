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

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public docInvitations$: Observable<Invitation[]>;
  public userInvitations$: Observable<Invitation[]>;
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
    this.permissionQuery.isSuperAdmin$.pipe().subscribe(isSuperAdmin => {
      if (isSuperAdmin) {
        const storeName = this.store.storeName;
        const queryFn = ref =>
          ref.where('organizationId', '==', this.authQuery.orgId).where('state', '==', 'pending');
        this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
        this.docInvitations$ = this.query.selectAll({
          filterBy: invitation => invitation.type === InvitationType.stakeholder,
          sortBy: 'date',
          sortByOrder: Order.DESC
        });
        this.userInvitations$ = this.query.selectAll({
          filterBy: invitation => invitation.type === InvitationType.fromUserToOrganization,
          sortBy: 'date',
          sortByOrder: Order.DESC
        });
      } else {
        const storeName = this.store.storeName;
        const queryFn = ref =>
          ref
            .where('organizationId', '==', this.authQuery.orgId)
            .where('state', '==', 'pending')
            .where('type', '==', InvitationType.stakeholder);
        this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
        this.docInvitations$ = this.query.selectAll({
          filterBy: invitation => invitation.type === InvitationType.stakeholder,
          sortBy: 'date',
          sortByOrder: Order.DESC
        });
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
