import { Component, Input, ChangeDetectionStrategy, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { MediaService } from '../../service';
import { sanitizeFileName, getMimeType } from '@blockframes/utils/file-sanitizer';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileMetaData, createStorageFile, allowedFiles, fileSizeToString, StorageFile, CollectionHoldingFile } from '@blockframes/model';
import { FileLabel, getFileMetadata, getFileStoragePath } from '../../utils';
import { FileUploaderService } from '../../file-uploader.service';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { getDeepValue } from '@blockframes/utils/pipes';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DocumentReference } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';

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
    const [collection, label, docId] = value;
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

  // Determine whether document subscription removal should be handled here or on parent component
  @Input() @boolean pushSubToStack = false;
  @Output() newSubscription = new EventEmitter<Subscription>();

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  private docSub: Subscription;
  private dropEnabledSteps: CropStep[] = ['drop', 'hovering'];

  constructor(
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
    private firestore: FirestoreService
  ) { }

  async ngOnInit() {
    if (this.listenToChanges) {
      const ref = this.firestore.getRef(`${this.metadata.collection}/${this.metadata.docId}`) as DocumentReference;
      this.docSub = fromRef(ref).pipe(map(snap => snap.data())).subscribe({
        next: data => {
          const media: StorageFile = this.formIndex !== undefined
            ? getDeepValue(data, this.metadata.field)[this.formIndex]
            : getDeepValue(data, this.metadata.field);
          if (media?.storagePath) {
            this.form.setValue(media);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        error: () => {}, // do nothing
      });

      if (this.pushSubToStack) this.newSubscription.emit(this.docSub);
    }
  }

  ngOnDestroy() {
    if (!this.pushSubToStack) this.docSub?.unsubscribe();
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
      return;
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
    this.form.reset(createStorageFile());

    this.fileUploader.nativeElement.value = null;
    this.selectionChange.emit('removed');
    this.form?.markAsDirty();

    this.nextStep('drop');
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }
}
