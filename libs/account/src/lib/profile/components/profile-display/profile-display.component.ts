
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { Profile } from '../../forms/profile-edit.form';
import { AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'account-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDisplayComponent implements OnInit {
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
