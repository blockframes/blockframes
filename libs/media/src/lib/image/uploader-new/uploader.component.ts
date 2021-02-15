import { Component, Input, ChangeDetectionStrategy, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject } from 'rxjs';
import { MediaService } from '../../+state/media.service';
import { ImageParameters } from '../../image/directives/imgix-helpers';
import { sanitizeFileName, getMimeType } from '@blockframes/utils/file-sanitizer';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { FileMetaData } from '../../+state/media.model';
import { CollectionHoldingFile, FileLabel, getFileMetadata, getFileStoragePath } from '../../+state/static-files';
import { FileUploaderService } from '../../+state/file-uploader.service';
import { StorageFile } from '../../+state/media.firestore';

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
  selector: '[meta] image-new-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent implements OnInit {

  ////////////////////////
  // Private Variables //
  //////////////////////

  private storagePath: string;
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

  metadata: FileMetaData;
  fileName: string;


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
  @Input() form: FormControl;

  @Input() set meta(value: [CollectionHoldingFile, FileLabel, string] | [CollectionHoldingFile, FileLabel, string, number]) {
    const [ collection, label, docId, index ] = value;
    this.storagePath = getFileStoragePath(collection, label);
    this.metadata = getFileMetadata(collection, label, docId, index);
  }

  @Input() index: number;

  @Input() setWidth?: number;
  /** Disable fileUploader & delete buttons in 'show' step */
  @Input() useFileUploader?= true;
  @Input() useDelete?= true;

  @Input() types: string[] = ['image/jpeg', 'image/png'];
  @Input() accept: string[] = ['.jpg', '.png'];

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  constructor(
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnInit() {
    const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.index);
    if (!!retrieved) {
      const blobUrl = URL.createObjectURL(retrieved);
      const previewUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
      this.previewUrl$.next(previewUrl);
      this.nextStep('show');
    } else {
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
    const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.index);
    if (!!retrieved) {
      this.nextStep('show');
    } else {
      this.nextStep('drop');
    };
  }

  ///////////
  // Steps //
  ///////////

  async goToShow() {
    this.previewUrl$.next(await this.getDownloadUrl({
      privacy: this.metadata.privacy,
      collection: this.metadata.collection,
      docId: this.metadata.docId,
      field: this.metadata.field,
      storagePath: this.storagePath
    }));
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
      // TODO keep track of crop state
      // this.form.patchValue({ cropped: false });
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

      this.uploaderService.addToQueue(this.storagePath, {
        fileName: fileName,
        file: blob,
        metadata: this.metadata
      });

      // TODO keep track of crop state
      // cropped state = true

    } catch (err) {
      console.error(err);
    }
  }

  delete() {
    if (this.croppedImage) {
      this.croppedImage = '';
    }

    this.uploaderService.removeFromQueue(this.storagePath, this.fileName)
    this.form.setValue('');

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
  private getDownloadUrl(file: StorageFile): Promise<string> {
    return this.mediaService.generateImgIxUrl(file, this.parameters);
  }
}
