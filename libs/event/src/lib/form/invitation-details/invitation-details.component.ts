import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'event-invitation-details',
  templateUrl: './invitation-details.component.html',
  styleUrls: ['./invitation-details.component.scss'],
  animations: [slideUpList('h2, mat-card')], // @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationDetailsComponent implements OnInit {
  eventId$: Observable<string>;
  invitations$: Observable<Invitation[]>;

  constructor(
    private invitationService: InvitationService,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event invitations');
    this.eventId$ = this.route.params.pipe(pluck('eventId'));

    this.invitations$ = this.eventId$.pipe(
      switchMap((eventId) => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', eventId)))
    );
  }
}
