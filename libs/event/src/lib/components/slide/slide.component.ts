import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ScreeningEvent } from '@blockframes/event/+state';
import { Invitation } from '@blockframes/model';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { fade } from '@blockframes/utils/animations/fade';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

@Component({
  selector: '[event] event-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSlideComponent {
  private _event = new BehaviorSubject<ScreeningEvent>(null);
  public event$ = this._event.asObservable();

  public invitation$: Observable<Invitation>;

  ltSm$ = this.breakpointsService.ltSm;

  @Input() set event(screening: ScreeningEvent) {
    this._event.next(screening);
  }
  get event() {
    return this._event.getValue();
  }

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationService: InvitationService
  ) { }

  ngOnInit() {
    this.invitation$ = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([event, invitations]) => invitations.find(invitation => invitation.eventId === event.id) ?? null)
    );
  }

}