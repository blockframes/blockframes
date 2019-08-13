import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationOperation } from '../../+state';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'organization-signer-form',
  templateUrl: './organization-signer-form.component.html',
  styleUrls: ['./organization-signer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationSignerFormComponent {

  @Input() operations: OrganizationOperation[];

  constructor(public controlContainer: ControlContainer) { }

  public get control() {
    return this.controlContainer.control;
  }
  
  isSelected(id: string) {
    return this.control.get('operationIds').value.includes(id);
  }

  public toggleSelection(toggle: MatSlideToggleChange, id: string) {
    const operationIds = this.control.get('operationsId').value.filter(operationId => operationId !== id);

    if (toggle.checked) {
      operationIds.push(id);
    }
    
    this.control.get('operationIds').patchValue(operationIds);
  }
}
