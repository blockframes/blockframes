import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService, InvitationStore } from '../+state';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state/permissions.query';
import { Order } from '@datorama/akita';
import { switchMap } from 'rxjs/operators';
import { InvitationType, Invitation } from '@blockframes/invitation/types';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public invitations$: Observable<Invitation[]>
  private sub: Subscription;

  constructor(
    private query: InvitationQuery,
    private store: InvitationStore,
    private service: InvitationService,
    private permissionQuery: PermissionsQuery,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    const storeName = this.store.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    if (!!this.authQuery.orgId) {
      this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
      this.invitations$ = this.permissionQuery.isAdmin$.pipe(
        switchMap(isAdmin => {
          const filterBy = invitation =>
            invitation.type === InvitationType.fromUserToOrganization ||
            invitation.type === InvitationType.toWorkOnDocument;
          if (isAdmin) {
            return this.query.selectAll({
              filterBy,
              sortBy: 'date',
              sortByOrder: Order.DESC
            });
          }
        })
      );
    }

  }

  ngOnDestroy() {
    this.sub.unsubscribe(); // TODO: Leads to an error and an empty page when no invitations on /c/organization/home => ISSUE#1337
  }
}
