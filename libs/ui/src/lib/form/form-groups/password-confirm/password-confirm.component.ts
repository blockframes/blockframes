import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RepeatPasswordStateMatcher } from '@blockframes/utils';

@Component({
  selector: 'form-group-password-confirm',
  templateUrl: './password-confirm.component.html',
  styleUrls: ['./password-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordConfirmComponent implements OnInit  {

  @Input() form: FormGroup;
  @Input() password = 'password';
  @Input() confirm = 'confirm';

  public passwordsMatcher: RepeatPasswordStateMatcher;

  constructor() {}

  ngOnInit(){
    this.passwordsMatcher = new RepeatPasswordStateMatcher(this.password, this.confirm);
  }

}
