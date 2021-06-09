
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MediaService } from '../../+state/media.service';
import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { ImageParameters } from '../../image/directives/imgix-helpers';
;
// import { WebkitElement } from '@blockframes/media/pdf/viewer/viewer.component';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[ref] pdf-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent implements OnInit {

  fullScreen = false;
  escapePressed = false;

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
    this.fullScreen = !this.fullScreen;
  }

  // @HostListener('document:keydown.escape', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   console.log(event);
  //   const keyPressed = event.keyCode;
  //   if (keyPressed === 27) {
  //     console.log('Escape!');
  //   }
  //   this.escapePressed = !this.escapePressed;
  // }
  @HostListener('window:keydown', ['$event'])
  escapeHandler(event: KeyboardEvent) {
    console.log(event.code);
    if (this.fullScreen && event.code === 'Escape') {
      console.log(event.code);
      // this.document.exitFullscreen();
      this.fullScreen = false;
    }
  }

  constructor(
    private el: ElementRef,
    private mediaService: MediaService,
    private container: ElementRef<HTMLDivElement>,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  async ngOnInit() {
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

closeFullScreen() {
  // if (this.fullScreen) {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
      console.log('chrome only');
      this.fullScreen = false;
    }
  // }
  // Safari Browser
  else if (this.document['webkitExitFullscreen']) {
    console.log('pour l\'amour du ciel');
    // this.el.nativeElement.webkitRequestFullscreen();
    this.document['webkitExitFullscreen']();
    this.fullScreen = false;
    // this.el.nativeElement.webkitRequestFullscreen() == !this.el.nativeElement.webkitRequestFullscreen();
  }
}

toggleFullScreen() {
  // toggleFullScreen(this.el, this.document, this.fullScreen);
  console.log('cc');

  // if(!this.fullScreen) {
    // console.log('pourquoi tu rentres dans le !this.fullscreen?!');
    // this.el.nativeElement.webkitRequestFullscreen();
    // this.fullScreen = true;
  // }


  if(!this.fullScreen) {
    if(this.document['requestFullscreen']) {
      this.document['requestFullscreen']();
      console.log('Fullscreen OPEN');
      this.fullScreen = true;
    } else if (this.el.nativeElement.webkitRequestFullscreen) {
      this.el.nativeElement.webkitRequestFullscreen();
      console.log('Fullscreen webkit SAFARI OPEN');
      this.fullScreen = true;
    }

  } else {
    const event = new KeyboardEvent("keydown",{
      'key': 'Escape'
      });

      if(event.defaultPrevented) {
        return;
      }
      this.document.dispatchEvent(event);
      console.log(event.key);
    if (this.document.exitFullscreen) {
      console.log(this.escapePressed);
      this.document.exitFullscreen();
      console.log('chrome only');
      this.fullScreen = false;
    } else if (this.document['webkitExitFullscreen']) {
      console.log('pour l\'amour du ciel');
      // this.el.nativeElement.webkitRequestFullscreen();
      this.document['webkitExitFullscreen']();
      this.fullScreen = false;
      // this.el.nativeElement.webkitRequestFullscreen() == !this.el.nativeElement.webkitRequestFullscreen();
    }
  }







  // if (!this.document.fullscreenEnabled && !undefined) {
  // // if (this.isWebkit(this.el.nativeElement)) {
  //   if(!this.fullScreen) {
  //     console.log('coucou2!!');
  //     //  this.document.fullscreenElement.requestFullscreen();
  //   //  if (!this.document.fullscreenEnabled && !undefined)
  //   //  this.el = test;
  //   this.el.nativeElement.webkitRequestFullscreen();
  //   //  toggleFullScreen(this.el.nativeElement.webkitRequestFullscreen(), this.document, this.fullScreen);
  //   }
  //   // terner:  ? !this.fullScreen : this.el.nativeElement.webKitExitFullscreen()
  //   // à garder si jamais: this.el.nativeElement.ALLOW_KEYBOARD_INPUT
  // } else if (this.isWebkit(this.document)) {
  //   console.log('affiche toi wsh');
  //   this.el.nativeElement.webkitExitFullscreen();
  // }
  // if (this.fullScreen){
  //   {
  //     console.log('COUCOU 3 !');
  //    /* !!this.document == this.isWebkit(this.document);*/
  //     toggleFullScreen(this.el.nativeElement.webkitExitFullscreen(), this.document, this.fullScreen);
  //   }
  // }



  // if (this.document.activeElement.onfullscreenchange(this.el.nativeElement.webkitExitFullscreen)) {
  //   if (this.fullScreen) { L'UN OU L'AUTRE, SOIT IF AU DESSUS SOIT CELUI LA A GAUCHE DE CE TEXTE
  //   console.log('ET ICI OH');
  //   this.el.nativeElement.webkitExitFullscreen();
  // }


}
  // isWebkit(el: Node): el is WebkitElement {
  //   return 'webkitRequestFullscreen' in this.el && 'webkitExitFullscreen' in this.el;
  // }

  handleControlChange(control: MeetingPdfControl) {
    // this function is called only in standalone mode
    // when the local controls have been updated by the user
    // we update the components control which is going to update the pdf img
    this.control = control;
  }
}
