
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { ProfileForm } from '../../forms/profile-edit.form';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'account-profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent implements OnInit {
  public opened = false;
  public editContent = "profile";
  public form: ProfileForm;

  constructor(private authQuery: AuthQuery) {}

  ngOnInit() {
    const user = this.authQuery.user;
    this.form = new ProfileForm(user);
  }

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }

  public get user$() {
    return this.form.valueChanges.pipe(startWith(this.form.value));
  }
}
