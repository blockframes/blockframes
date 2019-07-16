
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'account-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {

  public user$: Observable<User>;
  public organization$: Observable<Organization>;
  @Output() editing = new EventEmitter<string>();

  constructor(public query: AuthQuery, private organizationQuery: OrganizationQuery){}

  ngOnInit() {
    this.user$ = this.query.user$;
    this.organization$ = this.organizationQuery.select('org');
  }
}
