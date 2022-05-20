import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

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

  public hidePassword = true

}