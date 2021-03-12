import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  getMimeType,
  sanitizeFileName,
} from '@blockframes/utils/file-sanitizer';
import { FileUploaderService } from '@blockframes/media/+state';
import { FileMetaData } from '../../+state/media.model';
import { allowedFiles, AllowedFileType } from '@blockframes/utils/utils';
import { CollectionHoldingFile, FileLabel, getFileMetadata, getFileStoragePath } from '../../+state/static-files';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { getDeepValue } from '@blockframes/utils/pipes';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { MovieVideoForm } from '@blockframes/movie/form/movie.form';

type UploadState = 'waiting' | 'hovering' | 'ready' | 'file';

function computeSize(fileSize: number) {
  const size = fileSize / 1000;
  if (size < 1000) {
    return `${size.toFixed(1)} KB`;
  } else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(1)} MB`;
  } else {
    return `${(size / (1000 * 1000)).toFixed(1)} GB`;
  }
}

@Component({
  selector: '[form][meta][accept] file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent implements OnInit, OnDestroy {

  public storagePath: string;
  public metadata: FileMetaData;

  private _form: StorageFileForm;
  get form() { return this._form; }
  @Input() set form(value: StorageFileForm) {
    this._form = value;
    this.computeState();
    this.sub?.unsubscribe();
    this.sub = this.form.valueChanges.subscribe(storageFile => {
      if (!!storageFile.storagePath) this.computeState();
      const extra = this.getExtra();
      if (!!extra) {
        this.metadata = { ...this.metadata, ...extra }
        const task = this.uploaderService.retrieveFromQueue(this.storagePath, this.queueIndex);
        if (!!task) {
          task.metadata = this.metadata;
          this.computeState();
        }
      }
    })
  }

  @Input() queueIndex: number;
  @Input() formIndex: number;
  @Input() set meta(value: [CollectionHoldingFile, FileLabel, string]) {
    const [collection, label, docId] = value;
    this.storagePath = getFileStoragePath(collection, label, docId);
    this.metadata = { ...getFileMetadata(collection, label, docId), ...this.getExtra() };
  }
  @Input() set accept(fileType: AllowedFileType | AllowedFileType[]) {
    const types = Array.isArray(fileType) ? fileType : [fileType]
    types.forEach(type => {
      this.allowedTypes = this.allowedTypes.concat(allowedFiles[type].extension);
      this.types = this.types.concat(allowedFiles[type].mime);
    })
  }

  // listen to db changes to keep form up-to-date after an upload
  @Input() @boolean listenToChanges: boolean;

  @Output() selectionChange = new EventEmitter<'added' | 'removed'>();

  public allowedTypes: string[] = [];
  public types: string[] = [];

  @ContentChild('onReady') onReadyTemplate: TemplateRef<any>;
  @ContentChild('onFile') onFileTemplate: TemplateRef<any>;
  @ViewChild('fileExplorer') fileExplorer: ElementRef<HTMLInputElement>;

  public localSize: string;
  public state$ = new BehaviorSubject<UploadState>('waiting');
  public file: File;
  public fileName: string;

  private sub: Subscription;
  private docSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnInit() {
    if (this.listenToChanges) {
      this.docSub = this.db.doc(`${this.metadata.collection}/${this.metadata.docId}`).valueChanges().subscribe(data => {
        const media = this.formIndex !== undefined
          ? getDeepValue(data, this.metadata.field)[this.formIndex]
          : getDeepValue(data, this.metadata.field);
        if (!!media) {
          if (this.form instanceof MovieVideoForm) {
            if (!media.description) { media.description = '' }
            if (!media.title) { media.title = '' }
            if (!media.type) { media.type = '' }
            if (!media.jwPlayerId) { media.jwPlayerId = '' }
          }
          this.form.setValue(media);
        }
      })
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (!!this.docSub) this.docSub.unsubscribe();
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    this.selected($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    this.state$.next('hovering');
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault();
    this.computeState();
  }


  public selected(files: FileList | File) {

    if ('item' in files) { // FileList
      if (!files.item(0)) {
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        if (!!this.file) {
          this.state$.next('file');
        } else {
          this.state$.next('waiting');
          this.fileExplorer.nativeElement.value = null;
        }
        return;
      }
      this.file = files.item(0);

    } else if (!files) { // No files
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        if (!!this.file) {
          this.state$.next('file');
        } else {
          this.state$.next('waiting');
          this.fileExplorer.nativeElement.value = null;
        }
        return;
    } else { // Single file
      this.file = files;
    }

    const fileType = getMimeType(this.file);

    // Hack around cypress issue with Files and events,
    // See https://github.com/cypress-io/cypress/issues/3613
    if (!(this.file instanceof File)) {
      // @ts-ignore
      this.file.__proto__ = new File([], fileType);
    }

    const isFileTypeValid = this.types && this.types.includes(fileType);
    if (!isFileTypeValid) {
      this.snackBar.open(`Unsupported file type: "${fileType}".`, 'close', { duration: 1000 });
      this.state$.next('waiting');
      this.fileExplorer.nativeElement.value = null;
      return;
    }

    this.state$.next('ready');
    this.fileName = sanitizeFileName(this.file.name);
    this.localSize = computeSize(this.file.size);

    this.uploaderService.addToQueue(this.storagePath, { fileName: this.fileName, file: this.file, metadata: this.metadata });
    this.selectionChange.emit('added');
  }

  public delete() {
    this.state$.next('waiting');
    this.fileExplorer.nativeElement.value = null;
    this.uploaderService.removeFromQueue(this.storagePath, this.fileName);
    this.form.reset();
    this.selectionChange.emit('removed');
  }

  private computeState() {
    if (!!this.form.get('storagePath').value) {
      this.state$.next('file');
      this.fileName = this.form.get('storagePath').value;
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.queueIndex);
      if (!!retrieved) {
        this.state$.next('ready');
        this.fileName = retrieved.fileName;
        this.localSize = computeSize(retrieved.file.size);
      } else {
        this.state$.next('waiting');
      }
    }
  }

  private getExtra() {
    const extraKeys = Object.keys(this.form.value).filter(key => !['privacy', 'collection', 'docId', 'field', 'storagePath'].includes(key));
    if (!!extraKeys.length) {
      const extra = {};
      for (const key of extraKeys) {
        extra[key] = this.form.value[key];
      }
      return extra;
    }
  }
}
