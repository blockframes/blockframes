
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
import { Subscription } from 'rxjs';

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
export class FileUploaderComponent implements OnDestroy {

  public storagePath: string;
  public metadata: FileMetaData;

  private _form: StorageFileForm;
  get form() { return this._form; }
  @Input() set form(value: StorageFileForm) {
    this._form = value;
    this.computeState();
    if (!!this.sub) this.sub.unsubscribe();
    this.sub = this.form.valueChanges.subscribe(storageFile => {
      if (!!storageFile.storagePath) this.computeState();
      const extra = this.getExtra();
      if (!!extra) {
        this.metadata = { ...this.metadata, ...extra }
        const task = this.uploaderService.retrieveFromQueue(this.storagePath);
        if (!!task) {
          task.metadata = this.metadata;
        }
      }
    })
  }


  @Input() index: number;
  @Input() set meta(value: [CollectionHoldingFile, FileLabel, string]) {
    const [ collection, label, docId ] = value;
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

  @Output() selectionChange = new EventEmitter<void>();

  public allowedTypes: string[] = [];
  public types: string[] = [];

  @ContentChild('onReady') onReadyTemplate: TemplateRef<any>;
  @ContentChild('onFile') onFileTemplate: TemplateRef<any>;
  @ViewChild('fileExplorer') fileExplorer: ElementRef<HTMLInputElement>;

  public localSize: string;
  public state: UploadState = 'waiting';
  public file: File;
  public fileName: string;

  private sub: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    this.selected($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    this.state = 'hovering';
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
          this.state = 'file';
        } else {
          this.state = 'waiting';
          this.fileExplorer.nativeElement.value = null;
        }
        return;
      }
      this.file = files.item(0);

    } else if (!files) { // No files
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        if (!!this.file) {
          this.state = 'file';
        } else {
          this.state = 'waiting';
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
      this.state = 'waiting';
      this.fileExplorer.nativeElement.value = null;
      return;
    }

    this.state = 'ready';
    this.fileName = sanitizeFileName(this.file.name);
    this.localSize = computeSize(this.file.size);

    this.uploaderService.addToQueue(this.storagePath, { fileName: this.fileName, file: this.file, metadata: this.metadata });
    this.selectionChange.emit();
  }

  public delete() {
    this.state = 'waiting';
    this.fileExplorer.nativeElement.value = null;
    this.uploaderService.removeFromQueue(this.storagePath, this.fileName);
    this.form.reset();
    this.selectionChange.emit();
  }

  private computeState() {
    if (!!this.form.get('storagePath').value) {
      this.state = 'file';
      this.fileName = this.form.get('storagePath').value;
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.index);
      if (!!retrieved) {
        this.state = 'ready';
        this.fileName = retrieved.fileName;
        this.localSize = computeSize(retrieved.file.size);
      } else {
        this.state = 'waiting';
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
