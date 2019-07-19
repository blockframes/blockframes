import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { OrganizationService } from '../../+state';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth';

export interface User {
  uid: string;
  email?: string;
}

@Component({
  selector: 'organization-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit, OnDestroy {
  public memberForm: FormGroup;
  public users: User[];
  private destroyed$ = new Subject();

  constructor(
    private service: OrganizationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.memberForm = this.builder.group({
      user: null,
      role: ''
    });
    this.onChange();
  }

  displayFn(user?: User): string | undefined {
    return user ? user.email : undefined;
  }

  public async addMember() {
    if (!this.memberForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }

    const { user, role } = this.memberForm.value;
    let email = user; // on user input, user = raw email string

    // on auto-complete, user = {id, email}
    if (typeof user !== typeof '') {
      email = user.email;
    }

    // Query a get or create user, to make ghost users when needed
    const { uid } = await this.authService.getOrCreateUserByMail(email);
    await this.service.addMember({ uid, email, roles: [role] });
    this.snackBar.open(`added user`, 'close', { duration: 2000 });
    this.memberForm.reset();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  private async onChange() {
    this.memberForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(async typingEmail => {
        this.users = await this.authService.getUserByMail(typingEmail.user);
        // TODO: use an observable => ISSUE#608
      });
  }
}
