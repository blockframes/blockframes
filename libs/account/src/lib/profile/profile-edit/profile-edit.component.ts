
import { Component, ChangeDetectionStrategy, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PersistNgFormPlugin } from '@datorama/akita';
import { AccountForm, User, AuthQuery, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { ProfileDeleteComponent } from '../profile-delete/profile-delete.component';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent implements OnInit, OnDestroy {

  public accountForm: FormGroup;
  public persistForm: PersistNgFormPlugin<AccountForm>;
  public user$: Observable<User>;
  private alive = true;

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;

    this.user$.pipe(takeWhile(_ => this.alive))
    .subscribe(user => {
      if (user !== null ) {
        this.accountForm = this.builder.group({
          uid: { value: user.uid, disabled: true },
          email: { value: user.email, disabled: true },
          first_name: [user.firstName, Validators.required],
          last_name: [user.lastName, Validators.required],
          biography: user.biography,
        });
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
      const { first_name, last_name, biography } = this.accountForm.value;

      this.authService.update(this.authQuery.user.uid, { firstName: first_name, lastName: last_name, biography })
      .then(() => {
        this.snackBar.open(`account updated`, 'close', { duration: 2000 });
        //this.accountForm.reset();
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