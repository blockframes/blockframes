import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SigninForm } from '../../../../user/src/lib/auth/forms/signin.form'


@Component({
  selector: 'eye-password',
  templateUrl: './eye-password.component.html',
  styleUrls: ['./eye-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EyePasswordComponent),
      multi: true
    }
  ]
})

export class EyePasswordComponent implements ControlValueAccessor {
  @Input() public placeholder : string
  @Input() public formControlName : string
  @Input() public form = new SigninForm()

  public hidePassword : boolean
    
  constructor( ) { }

  onChange: any = () => {}
  onTouch: any = () => {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(input: string) {
    this.formControlName = input;
  }
  
}