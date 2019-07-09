import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import * as firebase from 'firebase';
import { OrganizationService } from '../../+state';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface User {
  uid: string;
  email?: string;
}

@Component({
  selector: 'org-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit, OnDestroy {
  public addMemberForm: FormGroup;
  public mailsOptions: User[];
  public destroyed$ = new Subject();

  constructor(
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {}

  ngOnInit() {
    this.addMemberForm = this.builder.group({
      user: null,
      role: ''
    });
    this.mailsOptions = [];
    this.onChange();
  }

  displayFn(user?: User): string | undefined {
    return user ? user.email : undefined;
  }

  public async addMember() {
    if (!this.addMemberForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }

    const { user, role } = this.addMemberForm.value;
    let email = user; // on user input, user = raw email string

    // on auto-complete, user = {id, email}
    if (typeof user !== typeof '') {
      email = user.email;
    }

    // Query a get or create user, to make ghost users when needed
    const { uid } = await this.getOrCreateUserByMail(email);
    await this.service.addMember({ uid, email, roles: [role] });
    this.snackBar.open(`added user`, 'close', { duration: 2000 });
    this.addMemberForm.reset();
  }

  private async getOrCreateUserByMail(email: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    return f({ email }).then(x => x.data);
  }

  private async listUserByMail(prefix: string): Promise<User[]> {
    const f = firebase.functions().httpsCallable('findUserByMail');
    return f({ prefix }).then(usersProposal => usersProposal.data);
  }

  private async onChange() {
    this.addMemberForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(userObject => {
      // TODO: debounce
      this.listUserByMail(userObject.user).then(users => {
        // TODO: use an observable
        this.mailsOptions = users;
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next;
    this.destroyed$.unsubscribe;
  }
}
