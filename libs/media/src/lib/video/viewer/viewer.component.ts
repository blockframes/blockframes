
import { DOCUMENT } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, OnDestroy, ViewChild, ViewEncapsulation } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthQuery } from "@blockframes/auth/+state";
import { MeetingVideoControl } from "@blockframes/event/+state/event.firestore";
import { MediaService } from "../../+state/media.service";
import { ImageParameters } from '../../image/directives/imgix-helpers';
import { loadJWPlayerScript } from "@blockframes/utils/utils";
import { BehaviorSubject } from "rxjs";
import { toggleFullScreen  } from '../../file/viewers/utils';
import { StorageVideo } from "@blockframes/media/+state/media.firestore";

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

  private player: any;
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

  // in order to have several player displayed in the same page
  // we need to randomize the html id,
  // otherwise all the players will be in the same div, each overwriting the previous one
  public playerContainerId = Math.random().toString(36).substr(2); // small random string composed of letters & numbers

  /** Keep track of wether the player is in full screen or not.
   * We cannot trust the `toggleFullScreen()` function for that because
   * full screen can be exited without our button (Escape key, etc...)
   */
  @HostListener('fullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authQuery: AuthQuery,
    private mediaService: MediaService,
    private functions: AngularFireFunctions,
    private snackBar: MatSnackBar,
  ) { }

  async initPlayer() {
    try {
      await this.waitForViewReady; // we need the container div to exists, so we wait for the ngAfterViewInit

      const playerUrl = this.functions.httpsCallable('playerUrl');
      const url = await playerUrl({}).toPromise<string>();
      await loadJWPlayerScript(this.document, url);

      const privateVideo = this.functions.httpsCallable('privateVideo');
      const { error, result } = await privateVideo({ eventId: this.eventId, video: this.ref }).toPromise();

      if (!!error) {
        // if error is set, result will contain the error message
        throw new Error(result);
      } else {

        // Watermark
        const parameters: ImageParameters = {
          auto: 'compress,format',
          fit: 'crop',
        };
        const watermarkRef = this.authQuery.user.watermark;
        if (!watermarkRef.storagePath) {
          throw new Error('We cannot load video without watermark.');
        }
        const watermarkUrl = await this.mediaService.generateImgIxUrl(watermarkRef, parameters);

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
            file: watermarkUrl,
          },
          image: `https://cdn.jwplayer.com/thumbs/${result.info.key}.jpg`,
        });

        this.player.on('ready', () => this.signalPlayerReady());
        this.updatePlayer();
      }
    } catch(error) {
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
    if (!!this.control) {
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
