import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService, InvitationStore, Invitation } from '../+state';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { DateGroup } from '@blockframes/utils/helpers';
import { ThemeService } from '@blockframes/ui/theme';
import { PermissionsQuery } from '@blockframes/permissions/+state/permissions.query';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  public invitationsByDate$: Observable<DateGroup<Invitation[]>>;
  public theme: string;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  private collectionSub: Subscription;
  private themeSub: Subscription;

  constructor(
    private query: InvitationQuery,
    private store: InvitationStore,
    private service: InvitationService,
    private authQuery: AuthQuery,
    private themeService: ThemeService,
    private permissionQuery: PermissionsQuery,
  ) { }

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);

    const storeName = this.store.storeName;
    if (this.authQuery.orgId) {
      /**
       * @dev We display all invitations whether user or org is invited or invinting
       * Only invitation where user or org is invited will have buttons to accept or decline
      */
      const syncs = [];
      const queryFn1 = ref => ref.where('toUser.uid', '==', this.authQuery.userId).where('status', '==', 'pending');
      const queryFn2 = ref => ref.where('fromUser.uid', '==', this.authQuery.userId).where('status', '==', 'pending');
      syncs.push(this.service.syncCollection(queryFn1, { storeName }));
      syncs.push(this.service.syncCollection(queryFn2, { storeName }));

      if(this.permissionQuery.isUserAdmin()){
        const queryFn3 = ref => ref.where('toOrg.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
        const queryFn4 = ref => ref.where('fromOrg.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
        syncs.push(this.service.syncCollection(queryFn3, { storeName }));
        syncs.push(this.service.syncCollection(queryFn4, { storeName }));
      }

      this.collectionSub = combineLatest(syncs).subscribe()

      this.themeSub = this.themeService.theme$.subscribe(theme => this.theme = theme);
      this.invitationsByDate$ = this.query.groupInvitationsByDate();
    }
  }

  ngOnDestroy() {
    if (this.collectionSub) this.collectionSub.unsubscribe(); // TODO: Leads to an error and an empty page when no invitations on /c/organization/home => ISSUE#1337
    if (this.themeSub) this.themeSub.unsubscribe();
  }
}
