import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { ReviewComponent } from '@blockframes/event/layout/review/review.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'event-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestListComponent implements OnInit {

  invitations$: Observable<Invitation[]>;

  constructor(
    private invitationService: InvitationService,
    private dynTitle: DynamicTitleService,
    private shell: ReviewComponent,
  ) { }

  get event$() {
    return this.shell.event$;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Event', 'Event invitations');
    this.invitations$ = this.event$.pipe(
      switchMap(event => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', event.id))
      ));
  }

}
