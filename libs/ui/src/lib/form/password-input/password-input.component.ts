import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: '[control] password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputComponent {
  @Input() public placeholder: string;
  @Input() public control : FormControl;
  @Input() public errorStateMatcher: ErrorStateMatcher;
  @Input() public label: string;
  public hidePassword = true;
}