import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSliderChange } from '@angular/material/slider';
import { createEvent, Event, EventService } from '@blockframes/event/+state';
import { Meeting, MeetingVideoControl } from '@blockframes/event/+state/event.firestore';
import { delay, debounceFactory } from '@blockframes/utils/helpers';
import { BehaviorSubject } from 'rxjs';

// JWPlayer library must be load by <script> tag at runtime and doesn't have types
declare const jwplayer: any;


@Component({
  selector: '[event] media-video-control',
  templateUrl: './video-control.component.html',
  styleUrls: ['./video-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoControlComponent implements AfterViewInit {

  /** Instance of the JWPlayer */
  private player: any;
  /** Backend functions to call in order to get the url of the video to play */
  private getVideoInfo = this.functions.httpsCallable('videoInfo');

  /** Promise that will resolve after the JWPlayer <script> tag is loaded */
  private waitForAfterInit = new Promise((res: (v: boolean) => void) => { this.signalEndOfInit = res; });
  /** Resolve function for the `waitForAfterInit` promise */
  private signalEndOfInit: (v: boolean) => void;

  /** Special flag to know wether or not we should react on the `meta` event */
  private firstMetaEvent: boolean;

  /** Promise that will resolve after the JWPlayer player is ready to receive commands */
  private waitForPlayerReady = new Promise((res: (v: boolean) => void) => { this.signalPlayerReady = res; });
  /** Resolve function for the `waitForPlayerReady` promise */
  private signalPlayerReady: (v: boolean) => void;

  /** Debounced seek function to avoid continuously seek position on slider value changes */
  private debouncedSeek = debounceFactory((position: number) => this.player.seek(position), 500);

  // Hold the event instance
  private _event: Event<Meeting>;
  get event() { return this._event; }
  @Input() set event(value: Event<Meeting>) {

    const hasSelectedFileChange = !this.event || !this.event.meta.selectedFile || this.event.meta.selectedFile !== value.meta.selectedFile;

    // ensure the event object is correct
    this._event = createEvent(value);

    if (hasSelectedFileChange) this.selectedFileChange();
  }

  /** Loading flag for the html template */
  loading$ = new BehaviorSubject(true);
  /** Hold the local video control state */
  control$ = new BehaviorSubject<MeetingVideoControl>(undefined);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private functions: AngularFireFunctions,
    private eventService: EventService,
  ) { }

  // TODO EXTRACT THIS
  /** Asynchronously load the JWPlayer <script> tag */
  async loadScript() {
    return new Promise(res => {
      const id = 'jwplayer-script';

      // check if the script tag already exists
      if (!this.document.getElementById(id)) {
        const script = this.document.createElement('script');
        script.setAttribute('id', id);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', 'https://cdn.jwplayer.com/libraries/lpkRdflk.js');
        document.head.appendChild(script);
        script.onload = () => {
          res();
        }
      } else {
        res(); // already loaded
      }
    });
  }

  async ngAfterViewInit() {
    this.signalEndOfInit(true);
  }

  updateControl(newControl: MeetingVideoControl, updateRemote = true) {
    // local update
    this.control$.next(newControl);

    // remote update
    if (updateRemote) {
      this.event.meta.controls[this.event.meta.selectedFile] = newControl;
      return this.eventService.update(this.event);
    }
  }

  async selectedFileChange() {

    this.loading$.next(true);

    // ensure that the component is already displayed
    // because we will need the container <div> to exists in order to init jwplayer
    await this.waitForAfterInit;

    // ensure that the jwplayer script is available in the global context
    // if the script is already loaded the promise do nothing and resolve instantly
    await this.loadScript();

    // load the player to the corresponding <div>
    this.player = jwplayer('phantom-player');

    // get the video url from the backend function
    const { error, result} = await this.getVideoInfo({ ref: this.event.meta.selectedFile }).toPromise();
    if (!!error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    } else {

      // load the video into the player
      this.player.setup({
        file: result,
      });
      // the player is invisible, so we should also mute it to be really a "phantom" player
      this.player.setMute(true);

      // check if the control already exist or if we should create it
      if (!this.event.meta.controls[this.event.meta.selectedFile]) {

        this.firstMetaEvent = true;

        // register listener to know when we first have access to the video duration
        this.player.on('meta', () => {

          // we want to execute this function only once and not on each 'meta' events
          if (!this.firstMetaEvent) return;
          this.firstMetaEvent = false;

          // get duration and create the control
          const duration = this.player.getDuration();
          const control: MeetingVideoControl = { type: 'video', isPlaying: false, position: 0, duration };
          this.updateControl(control);

          // stop teh player and signal it's ready
          this.player.stop();
          this.signalPlayerReady(true);
        });

        this.player.play(); // trigger play to load the video metadata

      } else {

        // retrieve the control from the store
        const control = this.event.meta.controls[this.event.meta.selectedFile] as MeetingVideoControl;

        if (control.type !== 'video') {
          throw new Error(`WRONG CONTROL : received ${control.type} control where a video control was expected`);
        }

        // we just load the remote control into the local one
        // so we should not update the remote
        this.updateControl(control, false);
        this.signalPlayerReady(true);
      }

      await this.waitForPlayerReady;

      this.player.seek(this.control$.getValue().position); // put the player to the actual control position

      // without this delay & pause there was a weird bug resulting in the player to autoplay
      await delay(300);
      this.player.pause();

      // Register the listeners
      this.player.on('play', (p) => {
        const newControl = this.control$.getValue();
        newControl.isPlaying = true;
        this.updateControl(newControl);
      });
      this.player.on('pause', () => {
        const newControl = this.control$.getValue();
        newControl.isPlaying = false;
        this.updateControl(newControl);
      });
      this.player.on('time', (time) => {
        const newControl = this.control$.getValue();
        newControl.position = time.position;
        this.updateControl(newControl, false); // only update local control to reflect position on te slider bar
      });
      this.player.on('seek', (seek) => {
        const newControl = this.control$.getValue();
        newControl.position = seek.offset;
        this.updateControl(newControl);
      });
    }
    this.loading$.next(false); // end of loading in the ui
  }

  // user clicked on the play/pause button
  toggle() {
    const control = this.control$.getValue();
    if (control.isPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  // user slide the time code slider
  seekPosition(event: MatSliderChange) {
    this.debouncedSeek(event.value); // prevent to trigger a player.seek 1000 time per seconds
  }
}
