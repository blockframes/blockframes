
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PersistNgFormPlugin } from '@datorama/akita';
import { AccountForm, User, AuthQuery, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
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
    // @todo use snapshot instead of observable #438
    this.user$.pipe(takeWhile(_ => this.alive))
    .subscribe(user => {
      if (user !== null ) {
        this.accountForm = new ProfileForm(user);
        this.persistForm = new PersistNgFormPlugin(this.authQuery, 'accountForm');
        this.persistForm.setForm(this.accountForm);
      }
    });
  }

  public updateProfile() {
    if (!this.accountForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }

    try {
      const { firstName, lastName, biography } = this.accountForm.value;

      this.authService.update(this.authQuery.user.uid, { firstName, lastName, biography })
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
