import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthQuery, User, AccountForm, AuthService } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PersistNgFormPlugin } from '@datorama/akita';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AccountDeleteComponent } from './../account-delete/account-delete.component'
import { Router } from '@angular/router';

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

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    this.user$ = this.authQuery.user$();

    this.accountForm = this.builder.group({
      uid: new FormControl({ value: this.authQuery.user.uid, disabled: true }),
      email: new FormControl({ value: this.authQuery.user.email, disabled: true }),
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      biography: ''
    });
    this.persistForm = new PersistNgFormPlugin(this.authQuery, 'accountForm');
    this.persistForm.setForm(this.accountForm);
  }

  public updateProfile() {
    if (!this.accountForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    
    try {
      const { firstName, lastName, biography } = this.accountForm.value;

      this.authService.updateUser(this.authQuery.user.uid, { firstName, lastName, biography })
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

    dialogRef.afterClosed().subscribe(async result => {
      if(result === this.authQuery.user.email) {
        this.snackBar.open(`account deleted`, 'close', { duration: 5000 });
        this.loggedOut.emit();
        this.router.navigate(['']);
        await this.authService.delete();
      }
    });
  }

  ngOnDestroy() {
  }
}
