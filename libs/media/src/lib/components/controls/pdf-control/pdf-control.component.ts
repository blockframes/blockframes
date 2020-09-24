import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { createEvent, Event, EventService } from '@blockframes/event/+state';
import { Meeting, MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { MediaService } from '../../../+state/media.service';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: '[event] media-pdf-control',
  templateUrl: './pdf-control.component.html',
  styleUrls: ['./pdf-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfControlComponent {

  private _event: Event<Meeting>;
  get event() { return this._event; }
  @Input() set event(value: Event<Meeting>) {
    // ensure the event object is correct
    this._event = createEvent(value);
    this.update();
  }

  loading$ = new BehaviorSubject(true);
  previousDisable$ = new BehaviorSubject(true);
  nextDisable$ = new BehaviorSubject(false);
  control$ = new BehaviorSubject<MeetingPdfControl>(undefined);

  constructor(
    private eventService: EventService,
    private mediaService: MediaService,
  ) { }

  async update() {

    if (!this.event.meta.controls[this.event.meta.selectedFile]) {
      this.loading$.next(true);

      // locally download the pdf file to count it's number of pages
      const url = await this.mediaService.generateImgIxUrl(this.event.meta.selectedFile);
      const response = await fetch(url);
      const textResult = await response.text();
      // this actually count the number of pages, the regex comes from stack overflow
      const totalPages = textResult.match(/\/Type[\s]*\/Page[^s]/g).length;

      const control: MeetingPdfControl = { type: 'pdf', currentPage: 1, totalPages };
      this.control$.next(control);

      this.event.meta.controls[this.event.meta.selectedFile] = control;
      this.eventService.update(this.event);

    } else {

      const control = this.event.meta.controls[this.event.meta.selectedFile];

      if (control.currentPage === 1) this.previousDisable$.next(true);
      else this.previousDisable$.next(false);

      if (control.currentPage === control.totalPages) this.nextDisable$.next(true);
      else this.nextDisable$.next(false);

      this.control$.next(control);
    }
    this.loading$.next(false);
  }

  previous() {
    const control = this.control$.getValue();

    if (control.currentPage === 1) return;

    control.currentPage = control.currentPage - 1;

    this.nextDisable$.next(false);
    if (control.currentPage === 1) this.previousDisable$.next(true);

    this.control$.next(control);
    this.event.meta.controls[this.event.meta.selectedFile] = control;
    this.eventService.update(this.event);
  }

  next() {
    const control = this.control$.getValue();

    if (control.currentPage === control.totalPages) return;

    control.currentPage = control.currentPage + 1;

    this.previousDisable$.next(false);
    if (control.currentPage === control.totalPages) this.nextDisable$.next(true);

    this.control$.next(control);
    this.event.meta.controls[this.event.meta.selectedFile] = control;
    this.eventService.update(this.event);
  }
}
