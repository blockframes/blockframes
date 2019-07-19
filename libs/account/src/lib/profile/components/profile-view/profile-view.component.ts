
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { Profile } from '../../forms/profile-edit.form';
import { AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'account-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public email: string;
  @Output() editing = new EventEmitter<string>();
  @Input() user$: Observable<Profile>;

  constructor(private organizationQuery: OrganizationQuery, private authQuery: AuthQuery){}

  ngOnInit() {
    this.organization$ = this.organizationQuery.select('org');
    this.email = this.authQuery.user.email;
  }
}
