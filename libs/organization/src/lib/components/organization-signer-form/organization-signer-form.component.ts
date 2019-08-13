import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationOperation, OrganizationMember } from '../../+state';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'organization-signer-form',
  templateUrl: './organization-signer-form.component.html',
  styleUrls: ['./organization-signer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationSignerFormComponent {

  // @Input() operations: OrganizationOperation[];
  @Input() member: OrganizationMember;

  constructor(public controlContainer: ControlContainer) { }

  public get control() {
    return this.controlContainer.control;
  }

  isSelected(id: string) { // TODO
    return false;
    // return this.control.get('operationIds').value.includes(id);
  }

  public toggleSelection(toggle: MatSlideToggleChange, id: string) { // TODO
    console.log(id, toggle.checked);
    // const operationIds = this.control.get('operationIds').value.filter(operationId => operationId !== id);
    // if (toggle.checked) {
    //   operationIds.push(id);
    // }

    // this.control.get('operationIds').patchValue(operationIds);
  }
}
