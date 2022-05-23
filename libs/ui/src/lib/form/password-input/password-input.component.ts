import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PasswordInputComponent {
  @Input() public placeholder: string;
  @Input() public control = new FormControl();
  @Input() public errorStateMatcher: ErrorStateMatcher;
  @Input() public label: string;
  @Input() public hidePassword : boolean

  @Output() switchHidePassword: EventEmitter<any> = new EventEmitter()

  public showHidePassword(){
      this.switchHidePassword.emit()
  }

}