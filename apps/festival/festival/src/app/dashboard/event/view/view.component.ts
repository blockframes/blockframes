import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit {

  event$ = this.query.selectActive();
  invitations$: Observable<Invitation[]>;


  constructor(
    private query: EventQuery,
    private invitationService: InvitationService,
  ) { }

  ngOnInit() {
    this.invitations$ = this.query.selectActiveId().pipe(
      switchMap(eventId => this.invitationService.valueChanges(ref => ref.where('docId', '==', eventId)))
    );
  }

}
