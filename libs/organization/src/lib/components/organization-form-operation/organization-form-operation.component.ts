import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[formGroup] organization-form-operation, [formGroupName] organization-form-operation',
  templateUrl: './organization-form-operation.component.html',
  styleUrls: ['./organization-form-operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationFormOperationComponent {

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get amounts() {
    return Array(this.control.get('members').value.length).fill(0).map( (_, i) => i+1);
  }

  public removeMember(id: string) {
    const members = this.control.get('members').value.filter(member => member.uid !== id);
    this.control.get('members').patchValue(members);
  }

}
