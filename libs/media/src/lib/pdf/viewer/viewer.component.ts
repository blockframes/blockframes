
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, ViewChild, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MediaService } from '@blockframes/media/+state/media.service';
import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { ImageParameters } from '@blockframes/media/image/directives/imgix-helpers';

import { toggleFullScreen } from '../../file/viewers/utils';

@Component({
  selector: '[storagePath] [docRef] [field] pdf-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent implements OnInit {

  fullScreen = false;

  private _storagePath: string;
  get storagePath() { return this._storagePath; }
  @Input() set storagePath(value: string) {
    this._storagePath = value;
  }

  private _docRef: string;
  get docRef() { return this._docRef; }
  @Input() set docRef(value: string) {
    this._docRef = value;
  }

  private _field: string;
  get field() { return this._field; }
  @Input() set field(value: string) {
    this._field = value;
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

  isPuppet$ = new BehaviorSubject(false);

  /** Keep track of wether the player is in full screen or not.
   * We cannot trust the `toggleFullScreen()` function for that because
   * full screen can be exited without our button (Escape key, etc...)
   */
  @HostListener('fullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  constructor(
    private el: ElementRef,
    private mediaService: MediaService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  async ngOnInit() {
    if (!!this.control) {

      // The parent passed a control in the Inputs.
      // It means that the component is a puppet (i.e. it should display the pdf as is)
      this.isPuppet$.next(true);
    } else {

      // The parent didn't pass any control, it's means the component is a standalone viewer
      // The component should handle the controls itself.
      this.isPuppet$.next(false);

      // locally download the pdf file to count it's number of pages
      const url = await this.mediaService.generateImgIxUrl(this.storagePath, this.docRef, this.field);
      const response = await fetch(url);
      const textResult = await response.text();
      // this actually count the number of pages, the regex comes from stack overflow
      const totalPages = textResult.match(/\/Type[\s]*\/Page[^s]/g).length;

      this.control = { type: 'pdf', currentPage: 1, totalPages };
    }
  }

  async generatePdfUrl() {

    const isLoading = !this.storagePath || !this.control || this.control.type !== 'pdf';
    if (isLoading) {
      this.pdfUrl$.next('');
      this.loading$.next(true);
      return;
    }

    this.fetching$.next(true);
    const param: ImageParameters = {
      page: this.control.currentPage,
      auto: 'compress,format'
    }
    const url = await this.mediaService.generateImgIxUrl(this.storagePath, this.docRef, this.field, param, this.eventId);
    this.pdfUrl$.next(url);
    this.fetching$.next(false);
    this.loading$.next(false);
  }

  toggleFullScreen() {
    toggleFullScreen(this.el, this.document, this.fullScreen);
  }

  handleControlChange(control: MeetingPdfControl) {
    // this function is called only in standalone mode
    // when the local controls have been updated by the user
    // we update the components control which is going to update the pdf img
    this.control = control;
  }
}
