import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { IcsService } from '@blockframes/utils/ics/ics.service';
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

  constructor(
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private icsService: IcsService,
    ) { }

  async ngOnInit() {
    this.org = await this.orgService.getValue(this.event.ownerOrgId);
    this.cdr.markForCheck();
  }

  exportToCalendar() {
    this.icsService.download([this.event]);
  }

}
