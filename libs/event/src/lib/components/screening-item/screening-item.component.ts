import { Component, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/service';
import { Invitation, ScreeningEvent } from '@blockframes/model';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { fade } from '@blockframes/utils/animations/fade';
import { MatDialog } from '@angular/material/dialog';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private _event = new BehaviorSubject<ScreeningEvent>(null);
  public event$ = this._event.asObservable();

  public invitation: Invitation;
  public requestSent = false;
  @Input() set event(screening: ScreeningEvent) {
    this._event.next(screening);
  }
  get event() {
    return this._event.getValue();
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private invitationService: InvitationService
  ) { }

  ngOnInit() {
    this.sub = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([event, invitations]) => invitations.find(invitation => invitation.eventId === event.id) ?? null)
    ).subscribe(invitation => {
      this.invitation = invitation
      this.cdr.markForCheck()
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  requestAskingPrice(movieId: string) {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: createModalData({ movieId }, 'large'),
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }

}
