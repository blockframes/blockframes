import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgMember, OrgMembersQuery, OrgMembersService, ROLES } from '../+state';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { takeWhile } from 'rxjs/operators';


interface User {
  id: string;
  email?: string;
}

@Component({
  selector: 'org-members-show',
  templateUrl: './org-members-show.component.html',
  styleUrls: ['./org-members-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgMembersShowComponent implements OnInit, OnDestroy {
  public members$: Observable<OrgMember[]>;
  public addMemberForm: FormGroup;
  public mailsOptions: User[];
  public rolesOptions: string[] = Object.values(ROLES);
  @Input() orgID: string;
  private alive: boolean;

  constructor(
    private service: OrgMembersService,
    private query: OrgMembersQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.alive = true;
    this.mailsOptions = [];
    this.service.subscribe(this.orgID).pipe(takeWhile(() => this.alive)).subscribe();
    this.members$ = this.query.selectAll();
    this.addMemberForm = this.builder.group({
      user: null,
      role: ''
    });
    this.onChange();
  }

  displayFn(user?: User): string | undefined {
    return user ? user.email : undefined;
  }

  public async submit() {
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
    const { id } = await this.getOrCreateUserByMail(email);
    console.debug('Created with=', { id, email, role, orgID: this.orgID });
    await this.service.addMember(this.orgID, { id, email, roles: [role] });
    this.snackBar.open(`added user`, 'close', { duration: 2000 });
    this.addMemberForm.reset();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  private async getOrCreateUserByMail(email: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    return f({ email }).then(x => x.data);
  }

  private async listUserByMail(prefix: string): Promise<User[]> {
    const f = firebase.functions().httpsCallable('findUserByMail');
    return f({ prefix }).then(x => x.data);
  }

  private async onChange() {
    this.addMemberForm.valueChanges.subscribe(x => {
      console.debug('form=', x);
      // TODO: debounce
      this.listUserByMail(x.user)
        .then(xs => {
          console.debug('got autocomplete=', xs);
          // TODO: use an observable
          this.mailsOptions = xs;
        });
    });
  }
}
