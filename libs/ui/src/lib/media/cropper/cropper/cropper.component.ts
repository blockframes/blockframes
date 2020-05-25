import { Component, Input, Renderer2, ElementRef, OnDestroy, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DropZoneDirective } from '../drop-zone.directive'
import { finalize, catchError, startWith, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { zoom, zoomDelay, check, finalZoom } from '@blockframes/utils/animations/cropper-animations';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { ImgRefForm } from '../../image-reference/image-reference.form';
import { ImgRef } from '@blockframes/utils/media/media.model';

type CropStep = 'drop' | 'crop' | 'upload' | 'upload_complete' | 'show';

const mediaRatio = {
  square: 1 / 1,
  banner: 16 / 9,
  poster: 3 / 4,
  still: 5 / 7
}

/** Convert base64 from ngx-image-cropper to blob for uploading in firebase */
function b64toBlob(data: string) {
  const [metadata, content] = data.split(',');
  const byteString = atob(content);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const type = metadata.split(';')[0].split(':')[1];
  return new Blob([ab], { type });
}

/** Check if the path is a file path */
function isFile(imgRef: ImgRef): boolean {
  if (!imgRef || !imgRef.ref) {
    return false;
  }
  const part = imgRef.ref.split('.');
  const last = part.pop();
  return part.length >= 1 && !last.includes('/');
}

@Component({
  selector: 'drop-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [DropZoneDirective],
  animations: [zoom, zoomDelay, check, finalZoom]
})
export class CropperComponent implements OnInit, OnDestroy {

  ////////////////////////
  // Private Variables //
  //////////////////////

  private ref: AngularFireStorageReference;
  private fileName: string;
  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');
  private sub = new Subscription;

  ///////////////////////
  // Public Variables //
  /////////////////////

  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: string;
  parentWidth: number;
  prev: CropStep;
  previewUrl: Observable<string | null>;
  percentage$: Observable<number>;
  resizing = false;

  /////////////
  // Inputs //
  ///////////

  @Input() set ratio(ratio: string) {
    if (!mediaRatio.hasOwnProperty(ratio)) {
      console.error(`"${ratio}" is not a valid ratio. Valid ratios are: ${Object.keys(mediaRatio).join(', ')}`);
    }
    this.cropRatio = mediaRatio[ratio];
    const el: HTMLElement = this._elementRef.nativeElement;
    this.parentWidth = el.clientWidth;
    this._renderer.setStyle(el, "height", `calc(40px+${this.parentWidth}px/${ratio})`)
  }
  @Input() form: ImgRefForm;
  @Input() setWidth?: number;
  @Input() storagePath: string;
  /** Disable fileuploader & delete buttons in 'show' step */
  @Input() useFileuploader?= true;
  @Input() useDelete?= true;
  @Input() useCopyToClipboard?= true;

  constructor(private storage: AngularFireStorage, private _renderer: Renderer2, private _elementRef: ElementRef) { }

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(
      startWith(this.form.value),
      tap(value => console.log(value))
    ).subscribe();
  }

  ///////////
  // Steps //
  ///////////

  // drop
  filesSelected(fileList: FileList): void {
    this.file = fileList[0];
    this.nextStep('crop');
  }

  // crop
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  /**
   * Upload the image
   */
  async cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet');
      }
      this.nextStep('upload');
      this.fileName = sanitizeFileName(this.file.name).replace(/(\.[\w\d_-]+)$/i, '.webp');
      this.ref = this.storage.ref(`${this.storagePath}/original/${this.fileName}`);
      const blob = b64toBlob(this.croppedImage);
      this.percentage$ = this.ref.put(blob).percentageChanges().pipe(
        finalize(async () => {
          this.form.get('urls').get('original').setValue(await this.ref.getDownloadURL().toPromise());
          this.nextStep('upload_complete')
        })
      );
    } catch (err) {
      console.error(err);
    }
  }

  async goToShow() {
    this.previewUrl = this.getDownloadUrl(this.ref);
    this.nextStep('show');
  }

  delete() {
    this.sub.add(this.previewUrl.subscribe(path => {
      this.storage.storage.refFromURL(path).delete();
      this.form.reset();
      this.nextStep('drop');
    }));
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }

  /** Returns an observable of the download url of an image based on its reference */
  private getDownloadUrl(ref: AngularFireStorageReference): Observable<string> {
    return ref.getDownloadURL().pipe(
      catchError(err => of(''))
    )
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
