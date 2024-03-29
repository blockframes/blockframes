import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/service';
import { StorageVideo, MeetingVideoControl, hasAnonymousIdentity } from '@blockframes/model';
import { ErrorResultResponse, getWatermark, loadJWPlayerScript } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs';
import { toggleFullScreen } from '../../file/viewers/utils';
import { EventService } from '@blockframes/event/service';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { CallableFunctions } from 'ngfire';

declare const jwplayer: any;

@Component({
  // ! Warning if you change the selector, be sure to also change it in the .scss
  selector: '[ref] video-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  encapsulation: ViewEncapsulation.None, // We use `None` because we need to override the nested jwplayer css
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoViewerComponent implements AfterViewInit, OnDestroy {

  @ViewChild('container') playerContainer: ElementRef<HTMLDivElement>;
  fullScreen = false;

  private player: typeof jwplayer;
  private timeout: number;

  private signalPlayerReady: () => void;
  private waitForPlayerReady: Promise<void>;

  private signalViewReady: () => void;
  private waitForViewReady: Promise<void> = new Promise(res => this.signalViewReady = res);

  private destroyed = false;

  public loading$ = new BehaviorSubject(true);

  private _ref: StorageVideo;
  get ref() { return this._ref; }
  @Input() set ref(value: StorageVideo) {
    // if the video file has changed
    if (!!value && this.ref?.storagePath !== value.storagePath) {
      this.resetPlayerState();
      this._ref = value;
      this.initPlayer();
    }
  }

  private _control: MeetingVideoControl;
  get control() { return this._control; }
  @Input() set control(value: MeetingVideoControl) {

    const controlChange = this.control?.isPlaying !== value.isPlaying
      || this.control.position !== value.position;

    if (!!value && controlChange) {
      this._control = { ...value };
      this.updatePlayer();
    }
  }

  private _eventId: string;
  get eventId() { return this._eventId; }
  @Input() set eventId(value: string) {
    this._eventId = value;
  }

  @Output() stateChange = new EventEmitter<'play' | 'pause' | 'complete'>();

  // in order to have several player displayed in the same page
  // we need to randomize the html id,
  // otherwise all the players will be in the same div, each overwriting the previous one
  public playerContainerId = Math.random().toString(36).substr(2); // small random string composed of letters & numbers

  /** Keep track of wether the player is in full screen or not.
   * We cannot trust the `toggleFullScreen()` function for that because
   * full screen can be exited without our button (Escape key, etc...)
   */
  @HostListener('fullscreenchange')
  @HostListener('webkitfullscreenchange')
  @HostListener('mozfullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
    private functions: CallableFunctions,
    private snackBar: MatSnackBar,
    private eventService: EventService,
  ) { }

  async initPlayer() {
    const errorMessage = 'There was a problem loading this video...';
    try {
      await this.waitForViewReady; // we need the container div to exists, so we wait for the ngAfterViewInit

      const url = await this.functions.call<unknown, string>('playerUrl', {});
      await loadJWPlayerScript(this.document, url);

      const anonymousCredentials = this.authService.anonymousCredentials;

      const { error, result } = await this.functions.call<{ eventId: string, video: StorageVideo, email?: string }, ErrorResultResponse>('privateVideo', {
        eventId: this.eventId,
        video: this.ref,
        email: anonymousCredentials?.email
      });

      if (error) {
        throw new Error(errorMessage);
      } else {

        // Watermark
        let watermark;
        const event = await this.eventService.getValue(this.eventId);
        if (this.authService.profile) {
          const { email, firstName, lastName } = this.authService.profile;
          watermark = getWatermark(email, firstName, lastName);
        } else if (hasAnonymousIdentity(anonymousCredentials, event.accessibility)) {
          const { email, firstName, lastName } = anonymousCredentials;
          watermark = getWatermark(email, firstName, lastName);
        }

        if (!watermark) {
          throw new Error(errorMessage);
        }

        // Auto refresh page when url expires
        const signedUrl = new URL(result.signedUrl);
        const expires = signedUrl.searchParams.get('exp');
        const timestamp = parseInt(expires, 10); // unix timestamp in seconds
        const millisecondTimestamp = timestamp * 1000; // js timestamp in milliseconds
        const refreshCountdown = millisecondTimestamp - Date.now();

        // meanwhile the component has been destroyed
        // this can happen if the component is placed in template that depend on an observable (`| async`)
        // in this case the jwp lib will not be able to instantiate the player
        // since the container div doesn't exists anymore
        if (this.destroyed) { return; }

        this.timeout = window.setTimeout(() => window.location.reload(), refreshCountdown);

        // Setup player
        this.player = jwplayer(this.playerContainerId);

        this.player.setup({
          controls: !this.control,
          file: result.signedUrl,
          logo: {
            file: watermark,
          },
          image: `https://cdn.jwplayer.com/thumbs/${result.info.key}.jpg`,
        });

        this.player.on('ready', () => this.signalPlayerReady());
        this.player.on('play', () => this.stateChange.emit('play'));
        this.player.on('pause', () => this.stateChange.emit('pause'));
        this.player.on('complete', () => this.stateChange.emit('complete'));
        this.updatePlayer();
      }
    } catch (err) {
      this.loading$.next(false);
      this.snackBar.openFromComponent(SnackbarErrorComponent, { data: err.message, duration: 7000 });
    }
  }

  ngAfterViewInit() {
    this.resetPlayerState();
    this.signalViewReady();
  }

  resetPlayerState() {
    this.waitForPlayerReady = new Promise(res => this.signalPlayerReady = res);
  }

  async updatePlayer() {

    if (!this.ref || !this.control || this.control.type !== 'video') return;

    await this.waitForPlayerReady;
    this.player.seek(this.control.position);
    this.control.isPlaying ? this.player.play() : this.player.pause();
  }

  toggleFullScreen() {
    if (this.control) {
      toggleFullScreen(this.playerContainer, this.document, this.fullScreen);
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    window.clearTimeout(this.timeout);
  }

  refresh() {
    window.location.reload();
  }
}
