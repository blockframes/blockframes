import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, Invitation } from '../+state';
import { Observable, Subscription } from 'rxjs';
import { DateGroup } from '@blockframes/utils/helpers';
import { ThemeService } from '@blockframes/ui/theme';
@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * @dev this component will be removed after homogenisation of festival & catalog.
 */
export class InvitationListComponent implements OnInit, OnDestroy {
  public invitationsByDate$: Observable<DateGroup<Invitation[]>>;
  public theme: string;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  private themeSub: Subscription;

  constructor(
    private query: InvitationQuery,
    private themeService: ThemeService,
  ) { }

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);
    this.themeSub = this.themeService.theme$.subscribe(theme => this.theme = theme);
    this.invitationsByDate$ = this.query.groupInvitationsByDate();
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
  }
}
