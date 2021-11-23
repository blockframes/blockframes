import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Event } from '@blockframes/event/+state/event.model';
import { Organization, OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'crm-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventInfoComponent implements OnInit {
  public org: Organization;

  @Input() event: Event

  constructor(private orgService: OrganizationService) { }

  async ngOnInit() {
    this.org = await this.orgService.getValue(this.event.ownerOrgId);
  }
}
