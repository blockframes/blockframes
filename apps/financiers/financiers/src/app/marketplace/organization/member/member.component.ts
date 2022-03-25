import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewComponent } from '../view/view.component';
import { switchMap } from 'rxjs/operators';
import { fadeList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Component({
  selector: 'financiers-marketplace-organization-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  animations: [fadeList('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit {

  public org$ = this.parent.org$;
  public members$ = this.org$.pipe(
    switchMap(org => this.orgService.getMembers(org.id, { removeConcierges: true }))
  );

  constructor(
    private parent: ViewComponent,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Sales Agent', 'Contact');
  }

}
