import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'org-approved-list',
  templateUrl: './organization-approved-list.component.html',
  styleUrls: ['./organization-approved-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationApprovedListComponent {
   /** Variable which contains the pending actions */
  // TODO: replace any
  @Input() public approvedActions: any;
}
