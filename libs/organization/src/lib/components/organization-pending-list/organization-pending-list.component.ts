import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'org-pending-list',
  templateUrl: './organization-pending-list.component.html',
  styleUrls: ['./organization-pending-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationPendingListComponent {
  /** Variable which contains the pending actions */
  // TODO: replace any
  @Input() pendingActions: any;
}
