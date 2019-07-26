import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../components/organization-member-add/organization-member-addcomponent';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'organization-member-view',
  templateUrl: './member-view.component.html',
  styleUrls: ['./member-view.component.scss']
})
export class MemberViewComponent implements OnInit {
  @Input() member: User;
  public isSuperAdmin$: Observable<boolean>;
  public isUserSuperAdmin$: Observable<boolean>;

  constructor(
    private permissionsQuery: PermissionsQuery,
    private permissionsService: PermissionsService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.isUserSuperAdmin$ = this.permissionsQuery.isUserSuperAdmin(this.member.uid);
    this.isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;
  }

  switchRoles() {
    this.permissionsService.switchRoles(this.member.uid);
    this.snackBar.open(`Changed ${this.member.email} role`, 'Close', {duration: 2000});
  }
}
