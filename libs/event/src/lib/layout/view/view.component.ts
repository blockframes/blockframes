import { Component, OnInit, Input } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class EventViewComponent implements OnInit {
  private _event = new BehaviorSubject<Event>(null);
  event$ = this._event.asObservable();
  invitation$: Observable<Invitation>;

  @Input() set event(event: Event) {
    this._event.next(event);
  }

  constructor(
    private invitationService: InvitationService,
    private authQuery: AuthQuery
  ) { }

  ngOnInit(): void {
    const uid = this.authQuery.userId;
    // this.invitation$ = this.event$.pipe(
    //   switchMap(event => {
    //     const querFn = ref => ref.where('docId', '==', this.event.id).where('toUser.uid', '==', uid);
    //     this.invitationService.valueChanges()
    //   })

    // )
  }

  addToCalendar() {}

  accept() {
    // this.invitationService.acceptInvitation(this.event);
  }

  refuse() {}
}
