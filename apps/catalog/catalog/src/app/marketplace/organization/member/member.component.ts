import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ViewComponent } from '../view/view.component';
import { switchMap } from 'rxjs/operators';
import { fade, fadeList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Component({
  selector: 'catalog-marketplace-organization-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  animations: [fade, fadeList('user-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit {
  @HostBinding('@fade') animation = true;

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
