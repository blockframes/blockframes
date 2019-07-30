import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] emailControl, organization-member-add',
  templateUrl: './organization-member-add.component.html',
  styleUrls: ['./organization-member-add.component.scss']
})
export class OrganizationMemberAddComponent {
  @Output() addedMember = new EventEmitter();

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
