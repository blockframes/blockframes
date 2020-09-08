import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DropZoneDirective } from './drop-zone.directive';
import { catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { zoom, zoomDelay, check, finalZoom } from '@blockframes/utils/animations/cropper-animations';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { from } from 'rxjs';
import { getStoragePath, sanitizeFileName } from '@blockframes/utils/file-sanitizer';

type CropStep = 'drop' | 'crop' | 'upload' | 'upload_complete' | 'show';

type MediaRatio = typeof mediaRatio;
type MediaRatioType = keyof MediaRatio;
const mediaRatio = {
  square: 1 / 1,
  banner: 16 / 9,
  poster: 3 / 4,
  still: 16 / 10
};

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
@Component({
  selector: 'drop-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [DropZoneDirective],
  animations: [zoom, zoomDelay, check, finalZoom]
})
export class CropperComponent implements OnInit {

  ////////////////////////
  // Private Variables //
  //////////////////////

  private ref: string;
  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');
  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
  };

  ///////////////////////
  // Public Variables //
  /////////////////////

  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: number;
  parentWidth: number;
  prev: CropStep;
  previewUrl$: Observable<string | null>;
  percentage$: Observable<number>;
  resizing = false;

  /////////////
  // Inputs //
  ///////////

  @Input() set ratio(ratio: MediaRatioType) {
    this.cropRatio = mediaRatio[ratio];
  }
  @Input() form?: HostedMediaForm;
  @Input() setWidth?: number;
  @Input() storagePath: string;
  /** Disable fileUploader & delete buttons in 'show' step */
  @Input() useFileUploader?= true;
  @Input() useDelete?= true;
  @Input() protected = false;

  constructor(private mediaService: MediaService) { }

  ngOnInit() {
    // show current image
    if (this.form.ref?.value) {
      this.ref = this.form.ref.value;
      this.goToShow();
    }
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

  async cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet');
      }

      const blob = b64toBlob(this.croppedImage);

      this.nextStep('show');

      // regexp selects part of string after the last . in the string (which is always the file extension) and replaces this by '.webp'
      const fileName = sanitizeFileName(this.file.name.replace(/(\.[\w\d_-]+)$/i, `.webp`));

      this.form.patchValue({
        ref: getStoragePath(this.storagePath, this.protected),
        blobOrFile: blob,
        delete: false,
        fileName: fileName,
      })
      this.form.markAsDirty();

    } catch (err) {
      console.error(err);
    }
  }

  async goToShow() {
    this.previewUrl$ = this.getDownloadUrl(this.ref);
    this.nextStep('show');
  }

  delete() {
    if (this.croppedImage) {
      this.croppedImage = '';
    }

    this.form.patchValue({
      delete: true
    })
    this.form.markAsDirty();

    this.nextStep('drop');
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }

  /** Returns an observable of the download url of an image based on its reference */
  private getDownloadUrl(ref: string): Observable<string> {
    return from(this.mediaService.generateSingleImageUrl(ref, this.parameters)).pipe(
      catchError(_ => of(''))
    )
  }

}
