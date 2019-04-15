import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthQuery, User, AccountForm, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PersistNgFormPlugin } from '@datorama/akita';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AccountDeleteComponent } from './../account-delete/account-delete.component'
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountProfileComponent implements OnInit, OnDestroy {
  @Output() loggedOut = new EventEmitter();

  public accountForm: FormGroup;
  public persistForm: PersistNgFormPlugin<AccountForm>;
  public user$: Observable<User>;
  private alive= true;

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
          uid: { value: user.identity, disabled: true },
          email: { value: user.email, disabled: true },
          firstName: [user.firstName, Validators.required],
          lastName: [user.lastName, Validators.required],
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
      const { firstName, lastName, biography } = this.accountForm.value;

      this.authService.update(this.authQuery.user.uid, { firstName, lastName, biography })
      .then(() => {
        this.snackBar.open(`account updated`, 'close', { duration: 2000 });
        //this.accountForm.reset();
      })
    } catch (err) {
      console.error(err);
    }
  }

  public deleteAccount() {
    const dialogRef = this.dialog.open(AccountDeleteComponent, {
      width: '450px',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === this.authQuery.user.email) {
        this.snackBar.open('Account deleted', 'close', { duration: 5000 });
        this.loggedOut.emit();
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
