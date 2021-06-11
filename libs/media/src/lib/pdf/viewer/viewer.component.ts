
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MediaService } from '../../+state/media.service';
import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { ImageParameters } from '../../image/directives/imgix-helpers';

import { toggleFullScreen } from '../../file/viewers/utils';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[ref] pdf-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent implements OnInit {

  fullScreen = false;
  public keypressed;
  private _ref: StorageFile;
  get ref() { return this._ref; }
  @Input() set ref(file: StorageFile) {
    this._ref = file;
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

    // if (!this.document.fullscreenElement && this.document['webkitIsFullScreen'] && !this.document['mozFullScreen'] && !this.document['msFullscreenElement']) {
      this.fullScreen = !this.fullScreen;
    //   ///fire your event
    // }
    // this.cdr.detectChanges();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.keypressed = event.code;
    // console.log(this.keypressed);
  }

  @HostListener('webkitfullscreenchange', ['$event'])

  screenChange(event) {
    this.fullScreen = !this.fullScreen;
  }

  // @HostListener('webkitfullscreenchange')
  // trackFullScreenModeSafari() {
  //   console.log('dans webkitfullscreenchange safari');
  //   console.log(this.fullScreen);
  //   // if (!this.document.fullscreenElement && this.document['webkitIsFullScreen'] && !this.document['mozFullScreen'] && !this.document['msFullscreenElement']) {
  //     this.fullScreen = !this.fullScreen;
  //     //   ///fire your event
  //   // }
  //   this.cdr.markForCheck();
  // }



  constructor(
    private el: ElementRef<HTMLDivElement>,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  async ngOnInit() {

    // this.document.addEventListener('webkitfullscreenchange', (event) => {
    //   console.log('dans addeventlistener');
    //   // document.fullscreenElement will point to the element that
    //   // is in fullscreen mode if there is one. If there isn't one,
    //   // the value of the property is null.
    //   if (document.fullscreenElement) {
    //     console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
    //   } else {
    //     console.log('fullscreen leaved');
    //     this.fullScreen = false;
    //   }
    // });

    if (this.control) {

      // The parent passed a control in the Inputs.
      // It means that the component is a puppet (i.e. it should display the pdf as is)
      this.isPuppet$.next(true);
    } else {

      // The parent didn't pass any control, it's means the component is a standalone viewer
      // The component should handle the controls itself.
      this.isPuppet$.next(false);

      // locally download the pdf file to count it's number of pages
      const url = await this.mediaService.generateImgIxUrl(this.ref);
      const response = await fetch(url);
      const textResult = await response.text();

      if (response.status !== 200) console.warn(`ERROR ${response.status} fetching the pdf:`, textResult);

      // this actually count the number of pages, the regex comes from stack overflow
      const totalPages = textResult.match(/\/Type[\s]*\/Page[^s]/g)?.length ?? 0;

      this.control = { type: 'pdf', currentPage: 1, totalPages };
    }

    // this.cdr.detectChanges();
  }

  async generatePdfUrl() {

    const isLoading = !this.ref || !this.control || this.control.type !== 'pdf';
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
    const url = await this.mediaService.generateImgIxUrl(this.ref, param, this.eventId);
    this.pdfUrl$.next(url);
    this.fetching$.next(false);
    this.loading$.next(false);
  }

test() {
  const is_safari = navigator.userAgent.indexOf('Safari') > -1;
  const is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
  const isFullscreen = toggleFullScreen(this.el, this.document, this.fullScreen);
  this.fullScreen = isFullscreen;
  console.log(this.fullScreen);
  // this.trackFullScreenMode();
  // if(!this.fullScreen) {
  //   if(this.el.nativeElement.requestFullscreen) {
  //     this.el.nativeElement.requestFullscreen();
  //     console.log('onlychrome');
  //     // this.fullScreen = true;
  //   } else if (this.el.nativeElement['webkitRequestFullscreen']) {
  //     console.log('wtf?', this.fullScreen);
  //     this.el.nativeElement['webkitRequestFullscreen']();
  //     this.fullScreen = true;
  //     this.cdr.markForCheck();
  //     console.log('dans else if webkit fullscreen', this.fullScreen);
  //   } //document: Document<HTMLdivElement>

  // } else {
  //   if (this.document.exitFullscreen) {
  //     console.log('document exitFullscreen');
  //     // this.fullScreen = false;
  //     this.document.exitFullscreen();

  //     // this.cdr.detectChanges();
  //   }

  //   else if (this.document['webkitExitFullscreen']) { //  && this.document['webkitIsFullScreen']


  //     //   console.log('after Propagation');
  //     // })

  //     // this.document.fullscreenEnabled
  //     console.log('sortie fullscreen safari 1', this.fullScreen);
  //     this.document.getElementsByTagName('button').item(13).click();
  //     this.document['webkitExitFullscreen']();
  //     this.fullScreen = false;
  //     console.log('sortie fullscreen safari 2', this.fullScreen);
  //     // this.trackFullScreenMode();

  //     this.cdr.markForCheck();

  //   }
  // }
}


exitHandler() {
// Any fullscreen change will trigger this function
// Normalscreen to fullscreen or fullscreen to normalscreen
// with the button or with ESC-key.
    if (!document.fullscreenElement && !document['webkitIsFullScreen'] && !document['mozFullScreen'] && !document['msFullscreenElement']) {

    this.fullScreen = false;
        // This event is always trickered, but it's meant to be trickered when ESCAPE is used,
    } else
    {
      this.fullScreen = true;
    }
}


onKeydown(event) {
  if (event.key === "Escape") {
    console.log(event);
    this.fullScreen = false;
  }
}

  handleControlChange(control: MeetingPdfControl) {
    // this function is called only in standalone mode
    // when the local controls have been updated by the user
    // we update the components control which is going to update the pdf img
    this.control = control;
  }
}
