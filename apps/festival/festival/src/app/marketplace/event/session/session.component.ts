import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { EventService, Event, EventQuery } from '@blockframes/event/+state';
import { Observable, Subscription } from 'rxjs';
import { AttendeeStatus, Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { UserService } from '@blockframes/user/+state/user.service';
import { Router } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  public showSession = true;
  public ownerIsPresent = false;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

  private sub: Subscription;
  private dialogSub: Subscription;

  private confirmDialog: MatDialogRef<any>
  private isAutoPlayEnabled = false;
  @ViewChild('autotester') autoPlayTester: ElementRef<HTMLVideoElement>;

  @HostListener('window:beforeunload')
  attendeeLeaves() {
    const event = this.eventQuery.getActive();
    if (event.type === 'meeting') {
      const meta: Meeting = { ...event.meta, attendees: {...event.meta.attendees} };
      if (event.isOwner) {
        const newAttendees: Record<string, AttendeeStatus> = {};
        Object.keys(meta.attendees).forEach(uid => newAttendees[uid] = 'ended');
        meta.attendees = newAttendees;
        this.service.update(event.id, { meta });
      } else if (!!meta.attendees[this.authQuery.userId]) {
        meta.attendees[this.authQuery.userId] = 'ended';
        this.service.update(event.id, { meta });
      }
    }
  }

  constructor(
    private eventQuery: EventQuery,
    private service: EventService,
    private movieService: MovieService,
    private authQuery: AuthQuery,
    private bottomSheet: MatBottomSheet,
    private userService: UserService,
    private router: Router,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.service.startLocalSession();
    this.event$ = this.service.queryDocs(this.eventQuery.getActiveId());
    this.sub = this.event$.subscribe(async event => {
      const fileSelected = !!event?.meta?.selectedFile;
      if (!fileSelected) {
        this.visioContainerSize = '100%';
      } else if (event.isOwner) {
        this.mediaContainerSize = '40%';
        this.visioContainerSize = '60%';
      } else {
        this.mediaContainerSize = '60%';
        this.visioContainerSize = '40%';
      }

      if (event.type === 'screening') {
        this.dynTitle.setPageTitle(event.title, 'Screening');
        if (!!(event.meta as Screening).titleId) {
          const movie = await this.movieService.getValue(event.meta.titleId as string);
          this.screeningFileRef = movie.promotional.videos?.screener?.ref ?? '';
        }
      } else if (event.type === 'meeting') {
        this.dynTitle.setPageTitle(event.title, 'Meeting');

        try {
          if (!this.isAutoPlayEnabled) {
            await this.autoPlayTester.nativeElement.play();
            this.autoPlayTester.nativeElement.pause();
            this.isAutoPlayEnabled = true;
          }
        } catch (error) {
          this.confirmDialog = this.dialog.open(ConfirmComponent, {
            data: {
              title: 'Your browser might be blocking autoplay',
              question: 'This can result in poor viewing experience during your meeting.\nYou can try to unblock autoplay by clicking the following button. If it doesn\'t work, please change your browser settings to allow autoplay.',
              buttonName: 'Unblock autoplay',
              onConfirm: () => {
                this.autoPlayTester.nativeElement.play();
                this.autoPlayTester.nativeElement.pause();
              },
            },
          });
          this.dialogSub = this.confirmDialog.afterClosed().subscribe(confirmed => {
            this.isAutoPlayEnabled = !!confirmed;
          });
        }

        const uid = this.authQuery.userId;
        if (event.isOwner) {
          const attendees = (event.meta as Meeting).attendees;
          if (attendees[uid] !== 'owner') {
            const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [uid]: 'owner' }};
            this.service.update(event.id, { meta });
          }

          const requestUids = Object.keys(attendees).filter(userId => attendees[userId] === 'requesting');
          const requests = await this.userService.getValue(requestUids);
          if (!!requests.length) {
            this.bottomSheet.open(DoorbellBottomSheetComponent, { data: { eventId: event.id, requests}, hasBackdrop: false });
          }
        } else {
          const userStatus = (event.meta as Meeting).attendees[uid];

          if (!userStatus || userStatus === 'ended') { // meeting session is over
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/ended`);
          } else if (userStatus !== 'accepted') { // user has been banned or something else
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/lobby`);
          }
        }
      }
    })
  }

  ngOnDestroy() {
    this.attendeeLeaves();
    this.sub.unsubscribe();
    this.dialogSub?.unsubscribe();
  }
}
