import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgMembersService, OrganizationQuery, Organization } from '../+state';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { RightsQuery } from 'libs/rights/src/lib/+state';


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
export class OrgMembersShowComponent implements OnInit {
  public org$: Observable<Organization>;
  public addMemberForm: FormGroup;
  public mailsOptions: User[];
  public isSuperAdmin: Observable<boolean>;

  constructor(
    private service: OrgMembersService,
    private rightsQuery: RightsQuery,
    private orgQuery: OrganizationQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.isSuperAdmin = this.rightsQuery.isSuperAdmin;
    this.addMemberForm = this.builder.group({
      user: null
    });
    this.mailsOptions = [];
    this.org$ = this.orgQuery.selectActive();
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
    await this.service.addMember(this.orgQuery.getActiveId(), { id, email, roles: [role] });
    this.snackBar.open(`added user`, 'close', { duration: 2000 });
    this.addMemberForm.reset();
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
      // TODO: debounce
      this.listUserByMail(x.user)
        .then(xs => {
          // TODO: use an observable
          this.mailsOptions = xs;
        });
    });
  }
}
