import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[formGroup] activeMembers, organization-quorum-form',
  templateUrl: './organization-operation-form.component.html',
  styleUrls: ['./organization-operation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationOperationFormComponent {

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get numbers() {
    return Array(this.control.get('members').value.length).fill(0).map( (_, i) => i+1);
  }

  public handleRemove(id: string) {
    const members = this.control.get('members').value.filter(member => member.uid !== id);
    this.control.get('members').patchValue(members);
  }

}
