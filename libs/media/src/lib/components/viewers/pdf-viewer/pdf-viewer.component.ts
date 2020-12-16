import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, ViewChild } from '@angular/core';

import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { MediaService } from '@blockframes/media/+state/media.service';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: '[ref] [control] event-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent {

  @ViewChild('container') pdfContainer: ElementRef<HTMLDivElement>;
  fullScreen = false;

  private _ref: string;
  get ref() { return this._ref; }
  @Input() set ref(value: string) {
    this._ref = value;
  }

  private _control: MeetingPdfControl;
  get control() { return this._control; }
  @Input() set control(value: MeetingPdfControl) {
    this._control = value;
    this.generatePdfUrl();
  }

  private _eventId: string;
  get eventId() { return this._eventId; }
  @Input() set eventId(value: string) {
    this._eventId = value;
    this.generatePdfUrl();
  }

  pdfUrl$ = new BehaviorSubject('');
  loading$ = new BehaviorSubject(true);
  fetching$ = new BehaviorSubject(false);

  /** Keep track of wether the player is in full screen or not.
   * We cannot trust the `toggleFullScreen()` function for that because
   * full screen can be exited without our button (Escape key, etc...)
   */
  @HostListener('fullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  constructor(
    private mediaService: MediaService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  async generatePdfUrl() {
    if (!this.ref || !this.control || this.control.type !== 'pdf') {
      this.pdfUrl$.next('');
      this.loading$.next(true);
    } else {
      this.fetching$.next(true);
      const param: ImageParameters = {
        page: this.control.currentPage,
        auto: 'compress,format'
      }
      const url = await this.mediaService.generateImgIxUrl(this.ref, param, this.eventId);
      this.pdfUrl$.next(url);
      this.loading$.next(false);
      this.fetching$.next(false);
    }
  }

  /** Toggle the full screen mode depending on the current full screen state */
  toggleFullScreen() {

    if (!this.fullScreen) {
      if (!!this.pdfContainer.nativeElement.requestFullscreen) {
        this.pdfContainer.nativeElement.requestFullscreen();

      // F***ing Safari Browser
      } else {
        (this.pdfContainer.nativeElement as any).webkitRequestFullscreen();
      }
    } else {
      if (!!this.document.exitFullscreen) {
        this.document.exitFullscreen();

      // F***ing Safari Browser
      } else {
        (this.document as any).webkitExitFullscreen();
      }
    }
  }
}
