import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgMember, OrgMembersQuery, OrgMembersService } from '../+state';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

const ROLES = ['ADMIN', 'READ', 'WRITE'];

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
  public rolesOptions: string[] = ROLES;
  @Input() orgID: string;

  constructor(
    private service: OrgMembersService,
    private query: OrgMembersQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.mailsOptions = [];
    this.service.subscribe(this.orgID);
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

    await this.service.addMember(this.orgID, this.addMemberForm.value);
    this.snackBar.open(`added user`, 'close', { duration: 1000 });
    this.addMemberForm.reset();
  }

  ngOnDestroy() {
  }

  private async onChange() {
    this.addMemberForm.valueChanges.subscribe(x => {
      console.debug('form=', x);
      // TODO: debounce
      const findUser = firebase.functions().httpsCallable('findUserByMail');
      findUser({ prefix: x.user })
        .then(xs => {
          console.debug('got autocomplete=', xs.data);
          // TODO: use an observable
          this.mailsOptions = xs.data;
        });
    });
  }
}
