import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationOperationForm } from '../../organization.form';

@Component({
  selector: '[formGroup] activeMembers, organization-quorum-form',
  templateUrl: './organization-quorum-form.component.html',
  styleUrls: ['./organization-quorum-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationQuorumFormComponent {
  /** Variable to iterate through with an ngFor to display the mat-select options */
  public numbers: number[];

  constructor(public controlContainer: ControlContainer) {
  }

  public get control(): OrganizationOperationForm {
    return this.controlContainer.control as OrganizationOperationForm;
  }
}
