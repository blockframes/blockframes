import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/service';
import { BehaviorSubject, firstValueFrom, interval, Observable, of, Subscription } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { TwilioService } from '@blockframes/utils/twilio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFileExtension } from '@blockframes/utils/file-sanitizer';
import { createScreeningAttendee, ErrorResultResponse, extensionToType, isMeeting } from '@blockframes/model';
import { MediaService } from '@blockframes/media/service';
import { InvitationService } from '@blockframes/invitation/service';
import { catchError, filter, pluck, scan, switchMap, tap } from 'rxjs/operators';
import { finalizeWithValue } from '@blockframes/utils/observable-helpers';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import {
  Event,
  isScreening,
  createMeetingAttendee,
  Meeting,
  MeetingPdfControl,
  MeetingVideoControl,
  Screening,
  Invitation,
  isSlate,
  Slate,
  StorageFile,
  StorageVideo
} from '@blockframes/model';
import { CallableFunctions } from 'ngfire';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

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
  public fileRef$ = new BehaviorSubject(null);

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
    private functions: CallableFunctions,
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private movieService: MovieService,
    private mediaService: MediaService,
    private authService: AuthService,
    private orgService: OrganizationService,
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
      catchError(() => {
        this.snackbar.open('Sorry, this event was deleted by the organizer.', 'close', { duration: 5000 });
        this.router.navigate([this.authService.profile ? '/c/o/marketplace' : '/'], { state: { eventDeleted: true } });
        return of(undefined);
      })
    );

    this.sub = this.event$.subscribe(async event => {

      // MEETING
      if (isMeeting(event)) {
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
              data: createModalData({
                title: 'Your browser might be blocking autoplay',
                question: 'This can result in poor viewing experience during your meeting.\nYou can try to unblock autoplay by clicking the following button. If it doesn\'t work, please change your browser settings to allow autoplay.',
                confirm: 'Unblock autoplay',
                onConfirm: () => {
                  this.autoPlayTester.nativeElement.play();
                  this.autoPlayTester.nativeElement.pause();
                }
              }),
              autoFocus: false
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
            const attendee = createMeetingAttendee(this.authService.anonymousOrRegularProfile, 'owner');
            await this.service.update(event.id, { [`meta.attendees.${this.authService.uid}`]: attendee });
          }

          const requests = Object.values(attendees).filter(attendee => attendee.status === 'requesting');


          if (requests.length) {
            this.bottomSheet.open(DoorbellBottomSheetComponent, { data: { eventId: event.id, requests }, hasBackdrop: false });
          }

          // If the current selected file hasn't any controls yet we should create them
          if (event.meta.selectedFile) {
            const selectedFile = event.meta.files.find(file => file.storagePath === event.meta.selectedFile);
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

        // SCREENING
      } else if (isScreening(event)) {
        this.dynTitle.setPageTitle(event.title, 'Screening');
        // create attendee in event
        if (!event.meta?.attendees[this.authService.uid]) {
          const isAnonymous = !this.authService.profile;
          const attendee = createScreeningAttendee(this.authService.anonymousOrRegularProfile, isAnonymous);
          await this.service.update(event.id, { [`meta.attendees.${this.authService.uid}`]: attendee });
        }

        if ((event.meta as Screening).titleId) {
          const movie = await this.movieService.getValue(event.meta.titleId as string);
          this.fileRef$.next(movie.promotional.videos?.screener);
          this.trackWatchTime(event);
        }

        // SLATE
      } else if (isSlate(event)) {
        this.dynTitle.setPageTitle(event.title, 'Slate');
        if ((event.meta as Slate).videoId) {
          const org = await this.orgService.getValue(event.ownerOrgId);
          this.fileRef$.next(org.documents.videos.find(v => v.fileId === event.meta.videoId));
          this.trackWatchTime(event);
        }
      }
    })
  }

  private async trackWatchTime(event: Event) {
    // if user is not a slate owner we need to track the watch time
    if (event.ownerOrgId !== this.authService.profile?.orgId) {
      // Try to get invitation the regular way
      const uidFilter = (invit: Invitation) => invit.toUser?.uid === this.authService.uid || invit.fromUser?.uid === this.authService.uid;
      const allInvitations = await firstValueFrom(this.invitationService.allInvitations$);
      let invitation = allInvitations.find(invit => invit.eventId === event.id && uidFilter(invit));

      // If user is logged-in as anonymous
      if (!invitation && this.authService.anonymousCredentials?.invitationId) {
        const invitationId = this.authService.anonymousCredentials?.invitationId;
        invitation = await this.invitationService.getValue(invitationId);
      }

      if (!invitation && event.accessibility !== 'public') {
        // this should never happen since previous checks & guard should have worked
        throw new Error('Missing Slate Invitation');
      } else if (invitation) {
        this.watchTimeInterval?.unsubscribe();

        let initializedWatchInfos = false;
        this.watchTimeInterval = interval(1000).pipe(
          filter(() => !!this.isPlaying),
          tap(() => {
            // Initialize once to zero as soon as user clicks on play
            if (!initializedWatchInfos) {
              this.invitationService.update(invitation.id, { watchInfos: { duration: invitation.watchInfos?.duration ?? 0, date: new Date() } });
              initializedWatchInfos = true;
            }
          }),
          scan(duration => duration + 1, invitation.watchInfos?.duration ?? 0),
          finalizeWithValue(duration => {
            if (duration !== undefined) this.invitationService.update(invitation.id, { watchInfos: { duration, date: new Date() } });
          }),
          filter(duration => duration % 60 === 0),
        ).subscribe(duration => {
          this.invitationService.update(invitation.id, { watchInfos: { duration, date: new Date() } });
        });
      }
    }
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
    this.service.update(event.id, { meta });
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
    const { error, result } = await this.functions.call<{ video: StorageVideo, eventId: string }, ErrorResultResponse>('privateVideo', { video, eventId });
    if (error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    }

    const duration = parseFloat(result.info.duration);
    return { type: 'video', isPlaying: false, position: 0, duration };
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
