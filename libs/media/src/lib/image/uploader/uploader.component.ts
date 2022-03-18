import { Component, Input, ChangeDetectionStrategy, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MediaService } from '../../+state/media.service';
import { ImageParameters } from '../../image/directives/imgix-helpers';
import { sanitizeFileName, getMimeType } from '@blockframes/utils/file-sanitizer';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileMetaData } from '../../+state/media.model';
import { CollectionHoldingFile, FileLabel, getFileMetadata, getFileStoragePath } from '../../+state/static-files';
import { FileUploaderService } from '../../+state/file-uploader.service';
import { StorageFile } from '../../+state/media.firestore';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { AngularFirestore } from '@angular/fire/firestore';
import { getDeepValue } from '@blockframes/utils/pipes';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { allowedFiles, fileSizeToString } from '@blockframes/utils/utils';

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
  selector: '[meta] image-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent implements OnInit, OnDestroy {

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

  public maxSize: number = 20 * 1000000;

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

  private _form: StorageFileForm;
  get form() { return this._form; }
  @Input() set form(value: StorageFileForm) {
    this._form = value;
    if (this.form.storagePath.value) {
      this.mediaService.generateImgIxUrl({
        ...this.metadata,
        storagePath: this.form.storagePath.value,
      }).then(previewUrl => {
        this.previewUrl$.next(previewUrl);
        this.nextStep('show');
      });
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.queueIndex);
      if (retrieved) {
        const blobUrl = URL.createObjectURL(retrieved.file);
        const previewUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
        this.previewUrl$.next(previewUrl);
        this.nextStep('show');
      }
    }
  }

  @Input() set meta(value: [CollectionHoldingFile, FileLabel, string]) {
    const [ collection, label, docId ] = value;
    this.storagePath = getFileStoragePath(collection, label, docId);
    this.metadata = getFileMetadata(collection, label, docId);
  }

  @Input() queueIndex: number;
  @Input() formIndex: number;

  @Input() setWidth?: number;
  /** Disable fileUploader & delete buttons in 'show' step */
  @Input() useFileUploader?= true;
  @Input() useDelete?= true;

  @Input() types: string[] = allowedFiles.image.mime;
  @Input() accept: string[] = allowedFiles.image.extension;

  // listen to db changes to keep form up-to-date after an upload
  @Input() @boolean listenToChanges: boolean;

  @Output() selectionChange = new EventEmitter<'added' | 'removed'>();

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  private docSub: Subscription;
  private dropEnabledSteps: CropStep[] = ['drop', 'hovering'];

  constructor(
    private db: AngularFirestore,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  async ngOnInit() {
    if (this.listenToChanges) {
      this.docSub = this.db.doc(`${this.metadata.collection}/${this.metadata.docId}`).valueChanges().subscribe(data => {
        const media = this.formIndex !== undefined
          ? getDeepValue(data, this.metadata.field)[this.formIndex]
          : getDeepValue(data, this.metadata.field);
        if (media) {
          this.form.setValue(media);
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.docSub) this.docSub.unsubscribe()
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    if (!this.dropEnabledSteps.includes(this.step.value)) return;
    if ($event.dataTransfer.files.length) {
      this.filesSelected($event.dataTransfer.files);
    } else {
      this.resetState();
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    if (!this.dropEnabledSteps.includes(this.step.value)) return;
    this.nextStep('hovering');
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault();
    if (!this.dropEnabledSteps.includes(this.step.value)) return;
    this.resetState();
  }

  private resetState() {
    if (this.form.storagePath.value) {
      this.mediaService.generateImgIxUrl({
        ...this.metadata,
        storagePath: this.form.storagePath.value,
      }).then(previewUrl => {
        this.previewUrl$.next(previewUrl);
        this.nextStep('show');
      });
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.queueIndex);
      if (retrieved) {
        this.nextStep('show');
      } else {
        this.nextStep('drop');
      };
    }
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.file.__proto__ = new File([], fileType);
    }

    const isFileTypeValid = this.types && this.types.includes(fileType);
    if (!isFileTypeValid) {
      this.snackBar.open(`Unsupported file type: "${fileType}".`, 'close', { duration: 3000 });
      this.delete();
    } else if (this.file.size >= this.maxSize) {
      this.snackBar.open(`Your image is too big: max allowed size is ${fileSizeToString(this.maxSize)}.`, 'close', { duration: 4000 });
      this.delete();
      return;
    } else {
      this.nextStep('crop');
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

      if (blob.size >= this.maxSize) {
        // b64toBlob can increase file size of image and thus cross the maxSize limit after first check (issue #7336)
        this.snackBar.open(`Your image is too big: max allowed size is ${fileSizeToString(this.maxSize)}.`, 'close', { duration: 4000 });
        this.delete();
        return;
      }

      this.nextStep('show');

      // regexp selects part of string after the last . in the string (which is always the file extension)
      // replaces this by '.webp'
      // and also postfix file name with a small random id allow the same image to be cropped several time without collision
      this.fileName = sanitizeFileName(this.file.name.replace(/(\.[\w\d_-]+)$/i, `-${Math.random().toString(36).substr(2)}.webp`));

      this.uploaderService.addToQueue(this.storagePath, {
        fileName: this.fileName,
        file: blob,
        metadata: this.metadata
      });
      this.selectionChange.emit('added');

      this.form?.markAsDirty();

    } catch (err) {
      console.error(err);
    }
  }

  delete() {
    if (this.croppedImage) {
      this.croppedImage = '';
    }

    this.uploaderService.removeFromQueue(this.storagePath, this.fileName);
    this.form.reset();

    this.fileUploader.nativeElement.value = null;
    this.selectionChange.emit('removed');
    this.form?.markAsDirty();

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
