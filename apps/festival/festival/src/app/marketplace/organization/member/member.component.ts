import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ViewComponent } from '../view/view.component';
import { switchMap } from 'rxjs/operators';
import { fade, fadeList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'festival-marketplace-organization-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  animations: [fade, fadeList('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit {
  @HostBinding('@fade') animation = true;

  public org$ = this.parent.org$;
  public isAnonymous: boolean;
  public members$ = combineLatest([this.org$, this.authService.isSignedInAnonymously()]).pipe(
    switchMap(([org, isAnonymous]) => this.orgService.getMembers(org, { removeConcierges: true, hideEmails: isAnonymous }))
  );

  constructor(
    private parent: ViewComponent,
    private orgService: OrganizationService,
    private authService: AuthService,
    private dynTitle: DynamicTitleService,
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Contact');
    this.isAnonymous = await this.authService.isSignedInAnonymously();
  }

}
