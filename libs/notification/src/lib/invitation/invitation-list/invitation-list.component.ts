import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService, InvitationStore } from '../+state';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public invitationsByDate$: Observable<{}>;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  private sub: Subscription;

  constructor(
    private query: InvitationQuery,
    private store: InvitationStore,
    private service: InvitationService,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);

    const storeName = this.store.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    if (this.authQuery.orgId) {
      this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
      this.invitationsByDate$ = this.query.groupInvitationsByDate();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe(); // TODO: Leads to an error and an empty page when no invitations on /c/organization/home => ISSUE#1337
  }
}
