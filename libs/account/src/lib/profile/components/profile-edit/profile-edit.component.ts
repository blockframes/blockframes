import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { User, AuthQuery, AuthService } from '@blockframes/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProfileForm, Profile } from '../../forms/profile-edit.form';
import { Subject } from 'rxjs';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  public accountForm: ProfileForm;
  public user: User;
  private destroyed$ = new Subject();

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.authQuery.user;
    this.accountForm = new ProfileForm();
    const profile: Profile = {
      name: this.user.name || '',
      surname: this.user.surname || '',
      phoneNumber: this.user.phoneNumber || '',
      position: this.user.position || ''
    };
    this.accountForm.setValue(profile);
    this.accountForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(_ => this.updateProfile());
  }

  public updateProfile() {
    if (!this.accountForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      return;
    }
    try {
      const { name, surname, phoneNumber, position } = this.accountForm.value;
      this.authService
        .update(this.authQuery.user.uid, { name, surname, phoneNumber, position })
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
