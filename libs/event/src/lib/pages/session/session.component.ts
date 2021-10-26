import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { EventService, Event, EventQuery, isScreening } from '@blockframes/event/+state';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { Meeting, MeetingPdfControl, MeetingVideoControl, Screening } from '@blockframes/event/+state/event.firestore';
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
import { getFileExtension } from '@blockframes/utils/file-sanitizer';
import { extensionToType } from '@blockframes/utils/utils';
import { MediaService } from '@blockframes/media/+state';
import { AngularFireFunctions } from '@angular/fire/functions';
import { StorageFile, StorageVideo } from '@blockframes/media/+state/media.firestore';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { filter, scan } from 'rxjs/operators';
import { finalizeWithValue } from '@blockframes/utils/observable-helpers';
import { createAnonymousUser } from '@blockframes/auth/+state';


const isMeeting = (meetingEvent: Event): meetingEvent is Event<Meeting> => {
  return meetingEvent.type === 'meeting';
};

@Component({
  selector: 'event-session',
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

  constructor(
    private functions: AngularFireFunctions,
    private eventQuery: EventQuery,
    private service: EventService,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private movieService: MovieService,
    private mediaService: MediaService,
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

      // SCREENING
      if (isScreening(event)) {
        this.dynTitle.setPageTitle(event.title, 'Screening');
        if ((event.meta as Screening).titleId) {
          const movie = await this.movieService.getValue(event.meta.titleId as string);
          this.screeningFileRef = movie.promotional.videos?.screener;

          // if user is not a screening owner we need to track the watch time
          if (event.ownerOrgId !== this.authQuery.orgId) {
            // Try to get invitation the regular way
            let [invitation] = this.invitationQuery.getAll({
              filterBy: invit => invit.eventId === event.id &&
                (
                  invit.toUser?.uid === this.authQuery.userId ||
                  invit.fromUser?.uid === this.authQuery.userId
                )
            });

            // If user is logged-in as anonymous
            if (!invitation && this.authQuery.anonymousCredentials?.invitationId) {
              const invitationId = this.authQuery.anonymousCredentials?.invitationId;
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
        const uid = this.authQuery.userId || this.authQuery.anonymousUserId;
        if (event.isOwner) {
          const attendees = event.meta.attendees;
          if (attendees[uid] !== 'owner') {
            const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [uid]: 'owner' } };
            this.service.update(event.id, { meta });
          }

          const requestUids = Object.keys(attendees).filter(userId => attendees[userId] === 'requesting');
          const requests = await this.userService.getValue(requestUids);

          if (event.accessibility === 'public' && requests.length !== requestUids.length) {
            const anonymousUsers = requestUids.filter(r => !requests.find(u => u.uid === r));
            anonymousUsers.forEach(uid => {
              requests.push(createAnonymousUser({ uid })); 
            })
          }

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
              this.select('');
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
          const userStatus = event.meta.attendees[uid];

          if (!userStatus || userStatus === 'ended') { // meeting session is over
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/ended`);
          } else if (userStatus !== 'accepted') { // user has been banned or something else
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/lobby`);
          } else {

            const hasOwner = Object.values(event.meta.attendees).some(status => status === 'owner');
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

  select(selectedFile: string) {
    const event: Event<Meeting> = this.eventQuery.getActive() as Event<Meeting>;
    const meta = { ...event.meta, selectedFile };
    this.service.update(event.id, { meta });
  }

  picked(files: string[]) {
    const event: Event<Meeting> = this.eventQuery.getActive() as Event<Meeting>;
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

    const { error, result } = await getVideoInfo({ video, eventId }).toPromise(); // @TODO #6756 meetings
    if (error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    }

    const duration = parseFloat(result.info.duration);
    return { type: 'video', isPlaying: false, position: 0, duration };
  }
}
