import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Event, Organization } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'crm-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventInfoComponent implements OnInit {
  public org: Organization;

  @Input() event: Event

  constructor(
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    ) { }

  async ngOnInit() {
    this.org = await this.orgService.getValue(this.event.ownerOrgId);
    this.cdr.markForCheck();
  }
}
