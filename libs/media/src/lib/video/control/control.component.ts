import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSliderChange } from '@angular/material/slider';
import { MeetingVideoControl } from '@blockframes/model';


@Component({
  selector: '[control] video-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoControlComponent {


  control$ = new BehaviorSubject<MeetingVideoControl>(undefined);
  @Input() set control(value: MeetingVideoControl) {
    this.control$.next(value);
  }

  @Output() controlChange = new EventEmitter<MeetingVideoControl>();


  /**
   * Hold the id of the setInterval callback that is used to
   * increment the time-code & slider of the video position
   */
  intervalId: number;


  startInterval() {
    this.intervalId = window.setInterval(() => {
      const newControl = this.control$.getValue();
      newControl.position += 1;

      // stop playback to avoid time-code being greater that video duration
      if (newControl.position > newControl.duration) {
        newControl.position = newControl.duration;
        newControl.isPlaying = false;
        window.clearInterval(this.intervalId);
      }

      this.control$.next(newControl);
    }, 1000);
  }

  stopInterval() {
    window.clearInterval(this.intervalId);
  }

  // user clicked on the play/pause button
  toggle() {
    const newControl = this.control$.getValue();
    newControl.isPlaying = !newControl.isPlaying;

    if (newControl.isPlaying) {
      if (newControl.position === newControl.duration) {
        newControl.position = 0;
      }
      this.startInterval();
    } else this.stopInterval();

    this.control$.next(newControl);
    this.controlChange.emit(newControl);
  }

  // user slide the time code slider
  // this function can triggered a lot of times in the same seconds
  // that's why we use a debounced to update the db
  seekPosition(event: MatSliderChange) {
    const newControl = this.control$.getValue();
    newControl.position = event.value;

    this.control$.next(newControl);
    this.controlChange.emit(newControl);
  }
}
