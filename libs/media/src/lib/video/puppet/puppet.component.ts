import { DOCUMENT } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthQuery } from "@blockframes/auth/+state";
import { MeetingVideoControl } from "@blockframes/event/+state/event.firestore";
import { MediaService } from "@blockframes/media/+state/media.service";
import { ImageParameters } from '@blockframes/media/image/directives/imgix-helpers';
import { loadJWPlayerScript } from "@blockframes/utils/utils";
import { BehaviorSubject } from "rxjs";
import { toggleFullScreen  } from '../../file/puppets/utils';

declare const jwplayer: any;

@Component({
  // ! Warning if you change the selector, be sure to also change it in the .scss
  selector: '[eventId] [ref] [control] video-puppet',
  templateUrl: './puppet.component.html',
  styleUrls: ['./puppet.component.scss'],
  encapsulation: ViewEncapsulation.None, // We use `None` because we need to override the nested jwplayer css
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPuppetComponent implements AfterViewInit {

  @ViewChild('container') playerContainer: ElementRef<HTMLDivElement>;
  fullScreen = false;

  private player: any;
  private signalPlayerReady: () => void;
  private waitForPlayerReady: Promise<void>;

  public loading$ = new BehaviorSubject(true);

  private _ref: string;
  get ref() { return this._ref; }
  @Input() set ref(value: string) {
    // if the video file has changed
    if (!!value && this.ref !== value) {
      this.resetPlayerState();
      this._ref = value;
      this.initPlayer();
    }
  }


  private _control: MeetingVideoControl;
  get control() { return this._control; }
  @Input() set control(value: MeetingVideoControl) {
    this._control = value;
    this.updatePlayer();
  }

  @Input() eventId: string;

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
      const privateVideo = this.functions.httpsCallable('privateVideo');
      const { error, result } = await privateVideo({ eventId: this.eventId, ref: this.ref }).toPromise();

      if (!!error) {
        // if error is set, result will contain the error message
        throw new Error(result);
      } else {
        const parameters: ImageParameters = {
          auto: 'compress,format',
          fit: 'crop',
        };
        const watermarkRef = this.authQuery.user.watermark;
        if (!watermarkRef) {
          throw new Error('We cannot load video without watermark.');
        }
        const watermarkUrl = await this.mediaService.generateImgIxUrl(watermarkRef, parameters);

        this.player = jwplayer('puppet-player');
        this.player.setup({
          controls: false,
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
      this.snackBar.open('Error while playing the video: ' + error, 'close', { duration: 8000 });
    }
  }

  async ngAfterViewInit() {
    this.resetPlayerState();
    await loadJWPlayerScript(this.document);
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
    toggleFullScreen(this.playerContainer, this.document, this.fullScreen);
  }
}
