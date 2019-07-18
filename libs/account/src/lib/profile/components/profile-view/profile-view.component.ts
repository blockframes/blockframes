
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { Profile } from '../../forms/profile-edit.form';

@Component({
  selector: 'account-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  @Output() editing = new EventEmitter<string>();
  @Input() user$: Observable<Profile>;

  constructor(private organizationQuery: OrganizationQuery){}

  ngOnInit() {
    this.organization$ = this.organizationQuery.select('org');
  }
}
