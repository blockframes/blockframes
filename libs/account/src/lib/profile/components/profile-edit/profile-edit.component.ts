import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { User, AuthQuery, AuthService } from '@blockframes/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeWhile, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProfileForm, Profile } from '../../forms/profile-edit.form';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  public accountForm: ProfileForm;
  public user: User;
  private alive = true;

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
        takeWhile(_ => this.alive)
      )
      .subscribe(_ => {
        debounceTime(2000);
        this.updateProfile();
      });
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

  // public deleteAccount() {
  //   const dialogRef = this.dialog.open(ProfileDeleteComponent, {
  //     width: '450px',
  //     data: { email: '' }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === this.authQuery.user.email) {
  //       this.snackBar.open('Account deleted', 'close', { duration: 5000 });
  //       this.authService.delete();
  //       this.router.navigate(['/auth']);
  //     } else if (result !== undefined) {
  //       this.snackBar.open('Type in your email to confirm deletion', 'close', { duration: 5000 });
  //     }
  //   });
  // }

  ngOnDestroy() {
    this.alive = false;
  }
}
