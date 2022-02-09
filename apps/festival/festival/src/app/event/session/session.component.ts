import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { EventService, Event, isScreening, createMeetingAttendee } from '@blockframes/event/+state';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { Meeting, MeetingPdfControl, MeetingVideoControl, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFileExtension } from '@blockframes/utils/file-sanitizer';
import { extensionToType } from '@blockframes/utils/utils';
import { MediaService } from '@blockframes/media/+state';
import { AngularFireFunctions } from '@angular/fire/functions';
import { StorageFile, StorageVideo } from '@blockframes/media/+state/media.firestore';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state';
import { filter, pluck, scan, switchMap, take } from 'rxjs/operators';
import { finalizeWithValue } from '@blockframes/utils/observable-helpers';
import { AuthService } from '@blockframes/auth/+state';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';

const isMeeting = (meetingEvent: Event): meetingEvent is Event<Meeting> => {
  return meetingEvent.type === 'meeting';
};

@Component({
  selector: 'festival-event-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  public showSession = true;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: StorageVideo;

  public creatingControl$ = new BehaviorSubject(false);

  private sub: Subscription;
  private dialogSub: Subscription;

  private confirmDialog: MatDialogRef<unknown>
  private isAutoPlayEnabled = false;
  @ViewChild('autotester') autoPlayTester: ElementRef<HTMLVideoElement>;

  private countdownId: number = undefined;

  private watchTimeInterval: Subscription;
  public isPlaying = false;
  public requestSent = false;

  constructor(
    private functions: AngularFireFunctions,
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private movieService: MovieService,
    private mediaService: MediaService,
    private authService: AuthService,
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private twilioService: TwilioService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.service.startLocalSession();

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
    );

    this.sub = this.event$.subscribe(async event => {

      // SCREENING
      if (isScreening(event)) {
        this.dynTitle.setPageTitle(event.title, 'Screening');
        if ((event.meta as Screening).titleId) {
          const movie = await this.movieService.getValue(event.meta.titleId as string);
          this.screeningFileRef = movie.promotional.videos?.screener;

          // if user is not a screening owner we need to track the watch time
          if (event.ownerOrgId !== this.authService.profile.orgId) {
            // Try to get invitation the regular way
            const uidFilter = (invit: Invitation) => invit.toUser?.uid === this.authService.uid ||  invit.fromUser?.uid === this.authService.uid;
            const allInvitations = await this.invitationService.allInvitations$.pipe(take(1)).toPromise();
            let invitation = allInvitations.find(invit => invit.eventId === event.id && uidFilter(invit));

            // If user is logged-in as anonymous
            if (!invitation && this.authService.anonymousCredentials?.invitationId) {
              const invitationId = this.authService.anonymousCredentials?.invitationId;
              invitation = await this.invitationService.getValue(invitationId);
            }

            if (!invitation && event.accessibility !== 'public') {
              // this should never happen since previous checks & guard should have worked
              throw new Error('Missing Screening Invitation');
            } else if (invitation) {
              this.watchTimeInterval?.unsubscribe();

              this.watchTimeInterval = interval(1000).pipe(
                filter(() => !!this.isPlaying),
                scan(watchTime => watchTime + 1, invitation.watchTime ?? 0),
                finalizeWithValue(watchTime => {
                  if (watchTime !== undefined) this.invitationService.update(invitation.id, { watchTime });
                }),
                filter(watchTime => watchTime % 60 === 0),
              ).subscribe(watchTime => {
                this.invitationService.update(invitation.id, { watchTime });
              });
            }

          }
        }

        // MEETING
      } else if (isMeeting(event)) {

        this.dynTitle.setPageTitle(event.title, 'Meeting');

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

        // Check for the autoplay
        try {
          if (!this.isAutoPlayEnabled) {
            await this.autoPlayTester.nativeElement.play();
            this.autoPlayTester.nativeElement.pause();
            this.isAutoPlayEnabled = true;
          }
        } catch (error) {
          if (!this.confirmDialog) {
            this.confirmDialog = this.dialog.open(ConfirmComponent, {
              data: {
                title: 'Your browser might be blocking autoplay',
                question: 'This can result in poor viewing experience during your meeting.\nYou can try to unblock autoplay by clicking the following button. If it doesn\'t work, please change your browser settings to allow autoplay.',
                confirm: 'Unblock autoplay',
                onConfirm: () => {
                  this.autoPlayTester.nativeElement.play();
                  this.autoPlayTester.nativeElement.pause();
                },
              },
              autoFocus: false,
            });
            this.dialogSub = this.confirmDialog.afterClosed().subscribe(confirmed => {
              this.isAutoPlayEnabled = !!confirmed;
            });
          }
        }

        // Manage redirect depending on attendees status & presence of meeting owners
        if (event.isOwner) {
          const attendees = event.meta.attendees;
          if (attendees[this.authService.uid]?.status !== 'owner') {
            const attendee = createMeetingAttendee(this.authService.profile || this.authService.anonymousCredentials, 'owner');
            const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [this.authService.uid]: attendee } };
            this.service.update(event.id, { meta });
          }

          const requests = Object.values(attendees).filter(attendee => attendee.status === 'requesting');


          if (requests.length) {
            this.bottomSheet.open(DoorbellBottomSheetComponent, { data: { eventId: event.id, requests }, hasBackdrop: false });
          }

          // If the current selected file hasn't any controls yet we should create them
          if (event.meta.selectedFile) {
            const selectedFile = event.meta.files.find(file =>
              file.storagePath === event.meta.selectedFile
            );
            if (!selectedFile) {
              console.warn('Selected file doesn\'t exists in this Meeting!');
              this.select('', event);
            }
            if (!event.meta.controls[selectedFile.storagePath]) {
              const fileType = extensionToType(getFileExtension(selectedFile.storagePath));
              switch (fileType) {
                case 'pdf': {
                  this.creatingControl$.next(true);
                  const control = await this.createPdfControl(selectedFile, event.id);
                  const controls = { ...event.meta.controls, [event.meta.selectedFile]: control };
                  const meta = { ...event.meta, controls };
                  await this.service.update(event.id, { meta });
                  this.creatingControl$.next(false);
                  break;
                } case 'video': {
                  this.creatingControl$.next(true);
                  const control = await this.createVideoControl((selectedFile as StorageVideo), event.id);
                  const controls = { ...event.meta.controls, [event.meta.selectedFile]: control };
                  const meta = { ...event.meta, controls };
                  await this.service.update(event.id, { meta });
                  this.creatingControl$.next(false);
                  break;
                } default: break;
              }
            }
          }
        } else {
          const userStatus = event.meta.attendees[this.authService.uid];

          if (!userStatus || userStatus?.status === 'ended') { // meeting session is over
            this.router.navigateByUrl(`/event/${event.id}/r/i/ended`);
          } else if (userStatus?.status !== 'accepted') { // user has been banned or something else
            this.router.navigateByUrl(`/event/${event.id}/r/i/lobby`);
          } else {

            const hasOwner = Object.values(event.meta.attendees).some(attendee => attendee.status === 'owner');
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

    this.snackbar.open(`The organizer just left the meeting room. You will be disconnected in ${durationMinutes} minute.`, 'dismiss', { duration: 5000 });
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
    if (this.countdownId) this.twilioService.disconnect();
    this.deleteCountDown();
    this.watchTimeInterval?.unsubscribe();
  }

  ngOnDestroy() {
    this.watchTimeInterval?.unsubscribe();
    this.twilioService.disconnect();
    this.deleteCountDown();
    this.sub.unsubscribe();
    this.dialogSub?.unsubscribe();
  }

  select(selectedFile: string, event: Event<Meeting>) {
    const meta = { ...event.meta, selectedFile };
    this.service.update(event.id, { meta });
  }

  picked(files: string[], event: Event<Meeting>) {
    const meta = { ...event.meta, files };
    this.service.update(event.id, { meta })
  }

  async createPdfControl(file: StorageFile, eventId: string): Promise<MeetingPdfControl> {
    // locally download the pdf file to count it's number of pages
    const url = await this.mediaService.generateImgIxUrl(file, {}, eventId);
    const response = await fetch(url);
    const textResult = await response.text();
    // this actually count the number of pages, the regex comes from stack overflow
    const totalPages = textResult.match(/\/Type[\s]*\/Page[^s]/g).length;

    return { type: 'pdf', currentPage: 1, totalPages };
  }

  async createVideoControl(video: StorageVideo, eventId: string): Promise<MeetingVideoControl> {
    const getVideoInfo = this.functions.httpsCallable('privateVideo');

    const { error, result } = await getVideoInfo({ video, eventId }).toPromise();
    if (error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    }

    const duration = parseFloat(result.info.duration);
    return { type: 'video', isPlaying: false, position: 0, duration };
  }

  requestAskingPrice(movieId: string) {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: { movieId },
      maxHeight: '80vh',
      maxWidth: '650px',
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
