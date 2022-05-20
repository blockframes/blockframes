import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';



@Component({
  selector: 'eye-password',
  templateUrl: './eye-password.component.html',
  styleUrls: ['./eye-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EyePasswordComponent {
  @Input() public placeholder: string;
  @Input() public control = new FormControl();
  @Input() public errorStateMatcher: ErrorStateMatcher;

  public hidePassword: boolean;

}