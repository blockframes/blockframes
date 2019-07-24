import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrganizationAction, OrganizationMember } from '../../+state';

@Component({
  selector: 'organization-quorum-repertory',
  templateUrl: './organization-quorum-repertory.component.html',
  styleUrls: ['./organization-quorum-repertory.component.scss']
})
export class OrganizationQuorumRepertoryComponent  {
  @Input() action: OrganizationAction;
  // TODO(PL): maybe there is a better type as object, but you have to emit the current member to delete,
  // as well as the current action.id 
  @Output() deleteActiveSigner = new EventEmitter<object>();
  @Output() newQuorumMember = new EventEmitter<number>();
  /** Variable to iterate through with an ngFor to display the mat-select options */
  public numbers: number[];

  // TODO(PL): on the top of the sidenav there is a dropdown menu, where you can specifiy the amount of
  // quorum members needed to sign this action
  constructor() {
    this.numbers = Array(this.action.quorumMembers).fill(0).map((x,i)=>i +1);
  }
  deleteSigner(member: OrganizationMember, action: OrganizationAction) {
    this.deleteActiveSigner.emit({member, action})
  }
}
