import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] roleControl, organization-member-form',
  templateUrl: './organization-member-form.component.html',
  styleUrls: ['./organization-member-form.component.scss']
})
export class OrganizationMemberFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
