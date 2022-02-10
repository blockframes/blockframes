import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation  } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { User, UserService } from '@blockframes/user/+state';
import { Observable } from 'rxjs';
import { switchMap, } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent implements OnInit {

  members$: Observable<User[]>;

  constructor(
    private userService: UserService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
    private snackBar: MatSnackBar,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Meeting info');

    this.members$ = this.orgService.currentOrg$.pipe(
      switchMap(org => this.userService.valueChanges(org.userIds))
    )
  }

  copied() {
    this.snackBar.open('Link copied', 'CLOSE', { duration: 4000 });
  }

}
