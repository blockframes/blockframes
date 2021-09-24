import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation  } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { User } from '@blockframes/auth/+state';
import { Observable } from 'rxjs';
import { switchMap, } from 'rxjs/operators';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'event-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check Antoine
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent implements OnInit {

  members$: Observable<User[]>;

  constructor(
    private userService: UserService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Meeting info');

    this.members$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.userService.valueChanges(org.userIds))
    )
  }

}
