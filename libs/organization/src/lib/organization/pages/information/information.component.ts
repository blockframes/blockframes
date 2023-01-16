import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { pluck, switchMap } from 'rxjs/operators';
import { fade, fadeList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'organization-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  animations: [fade, fadeList('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationComponent implements OnInit {
  @HostBinding('@fade') animation = true;

  public org$ = this.route.params.pipe(
    pluck('orgId'),
    switchMap((orgId: string) => this.orgService.getValue(orgId))
  );

  public isAnonymous: boolean;
  public members$ = combineLatest([this.org$, this.authService.isSignedInAnonymously()]).pipe(
    switchMap(([org, isAnonymous]) => this.orgService.getMembers(org, { removeConcierges: true, hideEmails: isAnonymous }))
  );

  constructor(
    private route: ActivatedRoute,
    private orgService: OrganizationService,
    private authService: AuthService,
    private dynTitle: DynamicTitleService,
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Contact');
    this.isAnonymous = await this.authService.isSignedInAnonymously();
  }

}
