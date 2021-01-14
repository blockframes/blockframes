import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { EventService, Event, EventQuery } from '@blockframes/event/+state';
import { Observable, Subscription } from 'rxjs';
import { Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { UserService } from '@blockframes/user/+state/user.service';
import { Router } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  public showSession = true;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

  private sub: Subscription;
  private dialogSub: Subscription;

  private confirmDialog: MatDialogRef<any>
  private isAutoPlayEnabled = false;
  @ViewChild('autotester') autoPlayTester: ElementRef<HTMLVideoElement>;

  private countdownId: number = undefined;

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
    private twilioService: TwilioService,
    private snackbar: MatSnackBar,
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

        // Check for the autoplay
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

        // Manage behavior depending on attendees status
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
          } else {

            const hasOwner = Object.values((event.meta as Meeting).attendees).some(status => status === 'owner');
            if (!hasOwner) {
              this.createCountDown();
            } else if (!!hasOwner && !!this.countdownId) {
              this.snackbar.open(`The meeting owner has reconnected`, 'dismiss', { duration: 5000 });
              this.deleteCountDown();
            }
          }
        }
      }
    })
  }

  createCountDown() {
    this.deleteCountDown();
    const durationMinutes = 1;
    // we use a random duration to avoid the Thundering Herd effect (https://en.wikipedia.org/wiki/Thundering_herd_problem)
    // firestore document only supports 1 write per seconds
    const randomDurationSeconds = Math.floor(Math.random() * 10);

    this.snackbar.open(`The meeting owner has leaved, you will be disconnected in ${durationMinutes}m.`, 'dismiss', { duration: 5000 });
    this.countdownId = window.setTimeout(
      () => this.autoLeave(),
      ((1000 * 60) * durationMinutes) + (1000 * randomDurationSeconds)
    );
  }

  deleteCountDown() {
    window.clearTimeout(this.countdownId);
    this.countdownId = undefined;
  }

  autoLeave() {
    if (!!this.countdownId) this.twilioService.disconnect();
    this.deleteCountDown();
  }

  ngOnDestroy() {
    this.deleteCountDown();
    this.sub.unsubscribe();
    this.dialogSub?.unsubscribe();
  }
}
