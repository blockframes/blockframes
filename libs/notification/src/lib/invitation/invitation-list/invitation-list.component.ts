import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService, InvitationStore } from '../+state';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { DateGroup } from '@blockframes/utils/helpers';
import { Invitation } from '@blockframes/invitation/types';
import { ThemeService } from '@blockframes/ui/theme';

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
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);

    const storeName = this.store.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    if (this.authQuery.orgId) {
      this.collectionSub = this.service.syncCollection(queryFn, { storeName }).subscribe();
      this.themeSub = this.themeService.theme$.subscribe(theme => this.theme = theme);
      this.invitationsByDate$ = this.query.groupInvitationsByDate();
    }
  }

  public get placeholderUrl() {
    return `/assets/images/${this.theme}/Avatar_250.png`;
  }

  ngOnDestroy() {
    this.collectionSub.unsubscribe(); // TODO: Leads to an error and an empty page when no invitations on /c/organization/home => ISSUE#1337
    this.themeSub.unsubscribe();
  }
}
