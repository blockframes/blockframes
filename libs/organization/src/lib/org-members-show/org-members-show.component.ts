import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrgMember, OrgMembersQuery, OrgMembersService } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-members-show',
  templateUrl: './org-members-show.component.html',
  styleUrls: ['./org-members-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgMembersShowComponent implements OnInit, OnDestroy {
  public members$: Observable<OrgMember[]>;
  public addMemberForm: FormGroup;
  @Input() orgID: string;

  constructor(
    private service: OrgMembersService,
    private query: OrgMembersQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder
  ) {
    console.error('CONSTRUCTOR', service);
  }

  ngOnInit() {
    console.error('SERVICE=', this.service);

    this.service.subscribe(this.orgID);
    this.members$ = this.query.selectAll();
    this.addMemberForm = this.builder.group({
      id: '',
      role: ''
    });
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
}
