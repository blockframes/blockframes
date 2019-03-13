import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgMember, OrgMembersQuery, OrgMembersService } from '../+state';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

const ROLES = ['ADMIN', 'READ', 'WRITE'];

@Component({
  selector: 'org-members-show',
  templateUrl: './org-members-show.component.html',
  styleUrls: ['./org-members-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgMembersShowComponent implements OnInit, OnDestroy {
  public members$: Observable<OrgMember[]>;
  public addMemberForm: FormGroup;
  public mailsOptions: string[] = [];
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
    this.service.subscribe(this.orgID);
    this.members$ = this.query.selectAll();
    this.addMemberForm = this.builder.group({
      email: '',
      role: ''
    });
    this.onChange();
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
      console.error(x);
      const findUser = firebase.functions().httpsCallable('findUserByMail');
      findUser({ prefix: x.email })
        .then(xs => this.mailsOptions = xs.data.map(x => x.email))
        .then(() => console.error(this.mailsOptions));

    });
  }
}
