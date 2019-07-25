import { ControlContainer } from '@angular/forms';
import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[formGroup] activeMembers, organization-quorum-form',
  templateUrl: './organization-quorum-form.component.html',
  styleUrls: ['./organization-quorum-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationQuorumFormComponent {
  // TODO (#679): maybe there is a better type than any
  @Output() deleteActiveSigner = new EventEmitter<any>();
  // TODO: when we know how many quorumMember is needed, this event should be emitted
  @Output() newQuorumMember = new EventEmitter<number>();
  /** Variable to iterate through with an ngFor to display the mat-select options */
  public numbers: number[];

  constructor(public controlContainer: ControlContainer) {
  }

  public get control() {
    return this.controlContainer.control;
  }
}
