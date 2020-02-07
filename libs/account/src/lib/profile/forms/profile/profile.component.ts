import { Component, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] profile-form, [formGroup] profile-form, profile-form',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'profile-form';

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
  ngOnInit() {
    this.control.get('email').disable();
  }
}
