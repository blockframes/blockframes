
import { DOCUMENT } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "@blockframes/auth/+state";
import { MeetingVideoControl } from "@blockframes/event/+state/event.firestore";
import { getWatermark, loadJWPlayerScript } from "@blockframes/utils/utils";
import { BehaviorSubject } from "rxjs";
import { toggleFullScreen } from '../../file/viewers/utils';
import { StorageVideo } from "@blockframes/media/+state/media.firestore";
import { EventService } from "@blockframes/event/+state";
import { hasAnonymousIdentity } from "@blockframes/auth/+state/auth.model";

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
      this._control = value;
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
    private functions: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private eventService: EventService,
  ) { }

  async initPlayer() {
    try {
      await this.waitForViewReady; // we need the container div to exists, so we wait for the ngAfterViewInit

      const playerUrl = this.functions.httpsCallable('playerUrl');
      const url = await playerUrl({}).toPromise<string>();
      await loadJWPlayerScript(this.document, url);

      const anonymousCredentials = this.authService.anonymousCredentials;

      const privateVideo = this.functions.httpsCallable('privateVideo');
      const { error, result } = await privateVideo({ eventId: this.eventId, video: this.ref, email: anonymousCredentials?.email }).toPromise();

      if (error) {
        // if error is set, result will contain the error message
        throw new Error(result);
      } else {

        // Watermark
        let watermark;
        const event = await this.eventService.getValue(this.eventId);
        if (this.authService.profile) {
          watermark = getWatermark(this.authService.profile.email, this.authService.profile.firstName, this.authService.profile.lastName);
        } else if (hasAnonymousIdentity(anonymousCredentials, event.accessibility)) {
          watermark = getWatermark(anonymousCredentials.email, anonymousCredentials.firstName, anonymousCredentials.lastName);
        }

        if (!watermark) {
          throw new Error('We cannot load video without watermark.');
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
    } catch (error) {
      this.loading$.next(false);
      console.warn(error);
      this.snackBar.open('Error while playing the video: ' + error, 'close', { duration: 8000 });
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
