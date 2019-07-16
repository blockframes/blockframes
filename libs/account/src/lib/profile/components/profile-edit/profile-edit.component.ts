
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { PersistNgFormPlugin } from '@datorama/akita';
import { AccountForm, User, AuthQuery, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { takeWhile, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProfileDeleteComponent } from '../../profile-delete/profile-delete.component';
import { ProfileForm } from '../../forms/profile-edit.form';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  public accountForm: ProfileForm;
  public persistForm: PersistNgFormPlugin<AccountForm>;
  public user$: Observable<User>;
  private alive = true;

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.accountForm = new ProfileForm();
    console.log(this.accountForm)
    // @todo use snapshot instead of observable #438
    this.user$.pipe(takeWhile(_ => this.alive))
    .subscribe(user => {
      if (user !== null ) {
        const user2 = {
          name: user.name || '',
          surname: user.surname || '',
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
          position: user.position || ''
        }
        // this.accountForm = new ProfileForm(user);
        this.persistForm = new PersistNgFormPlugin(this.authQuery, 'accountForm');
        this.persistForm.setForm(this.accountForm, { emitEvent: false});
        this.accountForm.setValue(user2, { emitEvent: false});
      }
    });
    this.accountForm.valueChanges.pipe(debounceTime(3000),
    distinctUntilChanged()).subscribe(form => {debounceTime(2000);this.updateProfile()});
  }

  public log() {
    console.log('lala')
  }

  public updateProfile() {
    if (!this.accountForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }

    try {
      const { name, surname, phoneNumber, email, position } = this.accountForm.value;

      this.authService.update(this.authQuery.user.uid, { name, surname, phoneNumber, email, position })
      .then(() => {
        this.snackBar.open(`account updated`, 'close', { duration: 2000 });
      })
    } catch (err) {
      console.error(err);
    }
  }

  public deleteAccount() {
    const dialogRef = this.dialog.open(ProfileDeleteComponent, {
      width: '450px',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === this.authQuery.user.email) {
        this.snackBar.open('Account deleted', 'close', { duration: 5000 });
        this.authService.delete();
        this.router.navigate(['/auth']);
      } else if (result !== undefined) {
        this.snackBar.open('Type in your email to confirm deletion', 'close', { duration: 5000 });
      }
    });
  }

  ngOnDestroy () {
    this.alive = false;
  }
}
