import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSliderChange } from '@angular/material/slider';
import { createEvent, Event, EventService } from '@blockframes/event/+state';
import { Meeting, MeetingVideoControl } from '@blockframes/event/+state/event.firestore';
import { debounceFactory } from '@blockframes/utils/helpers';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: '[event] media-video-control',
  templateUrl: './video-control.component.html',
  styleUrls: ['./video-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoControlComponent {

  /** Backend functions to call in order to get the url of the video to play */
  private getVideoInfo = this.functions.httpsCallable('privateVideo');

  /** A debounced version of `updateRemoteControl` to avoid writing on the db more than every 500ms */
  private debouncedUpdateRemoteControl = debounceFactory((newControl: MeetingVideoControl) => this.updateRemoteControl(newControl), 500);

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
  localControl$ = new BehaviorSubject<MeetingVideoControl>(undefined);

  intervalId: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private functions: AngularFireFunctions,
    private eventService: EventService,
  ) { }

  updateRemoteControl(newControl: MeetingVideoControl) {
    this.event.meta.controls[this.event.meta.selectedFile] = newControl;
    return this.eventService.update(this.event);
  }

  async selectedFileChange() {

    this.loading$.next(true);

    // check if the control already exist or if we should create it
    if (!this.event.meta.controls[this.event.meta.selectedFile]) {

      // get the video info from the backend function
      const { error, result} = await this.getVideoInfo({ eventId: this.event.id, ref: this.event.meta.selectedFile }).toPromise();
      if (!!error) {
        // if error is set, result will contain the error message
        throw new Error(result);
      } else {
        const duration = parseFloat(result.info.duration);
        const newControl: MeetingVideoControl = { type: 'video', isPlaying: false, position: 0, duration };
        this.localControl$.next(newControl);
        this.updateRemoteControl(newControl);
      }
    } else {

      // retrieve the control from the store
      const newControl = this.event.meta.controls[this.event.meta.selectedFile] as MeetingVideoControl;

      if (newControl.type !== 'video') {
        throw new Error(`WRONG CONTROL : received ${newControl.type} control where a video control was expected`);
      }

      // we just load the remote control into the local one
      // so we should not update the remote
      this.localControl$.next(newControl);
    }

    this.loading$.next(false); // end of loading in the ui
  }

  play() {
    this.intervalId = window.setInterval(() => {
      const newControl = this.localControl$.getValue();
      newControl.position += 1;
      this.localControl$.next(newControl);
    }, 1000);
  }

  pause() {
    window.clearInterval(this.intervalId);
  }

  // user clicked on the play/pause button
  toggle() {
    const newControl = this.localControl$.getValue();
    newControl.isPlaying = !newControl.isPlaying;

    if (newControl.isPlaying) this.play();
    else this.pause();

    this.localControl$.next(newControl);
    this.updateRemoteControl(newControl);
  }

  // user slide the time code slider
  // this function can triggered a lot of times in the same seconds
  // that's why we use a debounced to update the db
  seekPosition(event: MatSliderChange) {
    const newControl = this.localControl$.getValue();
    newControl.position = event.value;

    this.localControl$.next(newControl);
    this.debouncedUpdateRemoteControl(newControl);
  }
}
