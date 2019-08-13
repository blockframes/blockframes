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

  @Input() member: OrganizationMember;

  constructor(public controlContainer: ControlContainer) { }

  public get control() {
    return this.controlContainer.control;
  }

  isSelected(operation: OrganizationOperation) {
    return operation.members.some(operationMember => operationMember.uid === this.member.uid);
  }

  public toggleSelection(toggle: MatSlideToggleChange, id: string) {
    const operations: OrganizationOperation[] = this.control.value.filter(operation => operation.id !== id);
    const currentOperation: OrganizationOperation = this.control.value.find(operation => operation.id === id);
    const members: OrganizationMember[] = currentOperation.members.filter(operationMember => operationMember.uid !== this.member.uid);
    if (toggle.checked) {
      members.push(this.member);
    }
    currentOperation.members = members;
    this.control.patchValue([...operations, currentOperation]);
  }
}
