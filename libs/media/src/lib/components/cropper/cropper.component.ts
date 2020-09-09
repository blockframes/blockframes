import { Component, Input, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject } from 'rxjs';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { generateBackgroundImageUrl, ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

type CropStep = 'drop' | 'crop' | 'hovering' | 'show';

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
})
export class CropperComponent implements OnInit {

  ////////////////////////
  // Private Variables //
  //////////////////////

  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');

  ///////////////////////
  // Public Variables //
  /////////////////////

  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: number;
  parentWidth: number;
  prev: CropStep;
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('');

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

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    // show current image
    if (!!this.form.blobOrFile.value) {
      const blobUrl = URL.createObjectURL(this.form.blobOrFile.value);
      const previewUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
      this.previewUrl$.next(previewUrl);
      this.nextStep('show');
    } else if (this.form.oldRef?.value) {
      const parameters: ImageParameters = {
        auto: 'compress,format',
        fit: 'crop',
        w: 300,
      };
      const previewUrl = generateBackgroundImageUrl(this.form.oldRef.value, parameters);
      this.previewUrl$.next(previewUrl);
      this.nextStep('show');
    }
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    this.filesSelected($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    this.nextStep('hovering');
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault();
    this.nextStep('drop');
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
      const fileName = this.file.name.replace(/(\.[\w\d_-]+)$/i, '.webp');

      this.form.patchValue({
        ref: `${this.storagePath}/`,
        blobOrFile: blob,
        delete: false,
        fileName: fileName,
      })
      this.form.markAsDirty();

    } catch (err) {
      console.error(err);
    }
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

}
