import { Component, Input, ChangeDetectionStrategy, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject } from 'rxjs';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { ImageParameters } from '@blockframes/media/image/directives/imgix-helpers';
import { getStoragePath, sanitizeFileName, Privacy, getMimeType } from '@blockframes/utils/file-sanitizer';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

type CropStep = 'drop' | 'crop' | 'hovering' | 'show';

type MediaRatio = typeof mediaRatio;
export type MediaRatioType = keyof MediaRatio;
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
  selector: 'image-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent implements OnInit {

  ////////////////////////
  // Private Variables //
  //////////////////////

  private ref: string;
  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');
  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
    w: 0,
  };

  ///////////////////////
  // Public Variables //
  /////////////////////

  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: number;
  cropDimensions: string;
  parentWidth: number;
  prev: CropStep;
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('');

  /////////////
  // Inputs //
  ///////////

  @Input() set ratio(ratio: MediaRatioType) {
    this.cropRatio = mediaRatio[ratio];

    switch (ratio) {
      case 'square':
        this.cropDimensions = 'Recommended : 512 x 512 px';
        break;
      case 'poster':
        this.cropDimensions = 'Ratio : 3:4';
        break;
      case 'banner':
        this.cropDimensions = 'Ratio : 16:9';
        break;
      case 'still':
        this.cropDimensions = 'Ratio : 16/10';
        break;
      default:
        throw new Error('Unknown ratio');
    }
  }
  @Input() form?: HostedMediaForm;
  @Input() setWidth?: number;
  @Input() storagePath: string;
  /** Disable fileUploader & delete buttons in 'show' step */
  @Input() useFileUploader?= true;
  @Input() useDelete?= true;
  @Input() filePrivacy: Privacy = 'public';
  @Input() types: string[] = ['image/jpeg', 'image/png'];
  @Input() accept: string[] = ['.jpg', '.png'];

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  constructor(
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    if (!!this.form.blobOrFile.value) {
      const blobUrl = URL.createObjectURL(this.form.blobOrFile.value);
      const previewUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
      this.previewUrl$.next(previewUrl);
      this.nextStep('show');
    } else if (!!this.form.oldRef?.value) {
      this.ref = this.form.oldRef.value;
      this.goToShow();
    }
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    if (!!$event.dataTransfer.files.length) {
      this.filesSelected($event.dataTransfer.files);
    } else {
      this.resetState();
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    this.nextStep('hovering');
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault();
    this.resetState();
  }

  private resetState() {
    if (!!this.form.blobOrFile.value || (!!this.form.ref?.value)) {
      this.nextStep('show');
    } else {
      this.nextStep('drop');
    };
  }

  ///////////
  // Steps //
  ///////////

  async goToShow() {
    this.previewUrl$.next(await this.getDownloadUrl(this.ref));
    this.nextStep('show');
  }


  // drop
  filesSelected(fileList: FileList): void {
    this.file = fileList[0];
    const fileType = getMimeType(this.file);

    // Hack around cypress issue with Files and events,
    // See https://github.com/cypress-io/cypress/issues/3613
    if (!(this.file instanceof File)) {
      // @ts-ignore
      this.file.__proto__ = new File([], fileType);
    }

    const isFileTypeValid = this.types && this.types.includes(fileType);
    if (!isFileTypeValid) {
      this.snackBar.open(`Unsupported file type: "${fileType}".`, 'close', { duration: 3000 });
      this.delete();
    } else {
      this.nextStep('crop');
      this.form.patchValue({ cropped: false });
      this.fileUploader.nativeElement.value = null;
    }

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

      // regexp selects part of string after the last . in the string (which is always the file extension)
      // replaces this by '.webp'
      // and also postfix file name with a small random id allow the same image to be cropped several time without collision
      const fileName = sanitizeFileName(this.file.name.replace(/(\.[\w\d_-]+)$/i, `-${Math.random().toString(36).substr(2)}.webp`));

      this.form.patchValue({
        ref: getStoragePath(this.storagePath, this.filePrivacy),
        blobOrFile: blob,
        fileName: fileName,
        cropped: true
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

    this.form.patchValue({ ref: '', blobOrFile: undefined });
    this.form.markAsDirty();
    this.fileUploader.nativeElement.value = null;

    this.nextStep('drop');
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }

  /**
   * Returns a promise with the download url of an image based on its reference.
   * If media is protected, this will also try to fetch a security token.
   * */
  private getDownloadUrl(ref: string): Promise<string> {
    return this.mediaService.generateImgIxUrl(ref, this.parameters);
  }
}
