import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] emailControl, member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  @Output() addedMember = new EventEmitter();

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
