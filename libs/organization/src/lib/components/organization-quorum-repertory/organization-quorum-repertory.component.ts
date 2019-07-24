import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationAction, OrganizationMember } from '../../+state';

@Component({
  selector: 'organization-quorum-repertory',
  templateUrl: './organization-quorum-repertory.component.html',
  styleUrls: ['./organization-quorum-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationQuorumRepertoryComponent  {
  @Input() action: OrganizationAction;
  // TODO (#679): maybe there is a better type than object
  @Output() deleteActiveSigner = new EventEmitter<object>();
  @Output() newQuorumMember = new EventEmitter<number>();
  /** Variable to iterate through with an ngFor to display the mat-select options */
  public numbers: number[];

  // TODO(PL): on the top of the sidenav there is a dropdown menu, where you can specifiy the amount of
  // quorum members needed to sign this action
  constructor() {
    this.numbers = Array(5).fill(0).map((x,i)=>i +1);
  }
  deleteSigner(member: OrganizationMember, action: OrganizationAction) {
    this.deleteActiveSigner.emit({member, action})
  }
}
