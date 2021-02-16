
import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  ViewChild,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  getMimeType,
  sanitizeFileName,
} from '@blockframes/utils/file-sanitizer';
import { FileUploaderService } from '@blockframes/media/+state';
import { FileMetaData } from '../../+state/media.model';
import { allowedFiles, AllowedFileType } from '@blockframes/utils/utils';
import { FormControl } from '@angular/forms';
import { CollectionHoldingFile, FileLabel, getFileMetadata, getFileStoragePath } from '../../+state/static-files';

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
  selector: '[meta] [accept] file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent implements OnInit {

  public storagePath: string;
  public metadata: FileMetaData;

  @Input() form: FormControl;
  @Input() input: number;
  @Input() set meta(value: [CollectionHoldingFile, FileLabel, string] | [CollectionHoldingFile, FileLabel, string, number]) {
    const [ collection, label, docId, index] = value;
    this.storagePath = getFileStoragePath(collection, label);
    this.metadata = getFileMetadata(collection, label, docId, index);
  }
  @Input() set accept(fileType: AllowedFileType | AllowedFileType[]) {
    const types = Array.isArray(fileType) ? fileType : [fileType]
    types.forEach(type => {
      this.allowedTypes = this.allowedTypes.concat(allowedFiles[type].extension);
      this.types = this.types.concat(allowedFiles[type].mime);
    })
  }
  @Output() change = new EventEmitter<void>();

  public allowedTypes: string[] = [];
  public types: string[] = [];

  @ContentChild('onReady') onReadyTemplate: TemplateRef<any>;
  @ContentChild('onFile') onFileTemplate: TemplateRef<any>;
  @ViewChild('fileExplorer') fileExplorer: ElementRef<HTMLInputElement>;

  public localSize: string;
  public state: UploadState = 'waiting';
  public file: File;
  public fileName: string;

  constructor(
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnInit() {
    this.computeState();
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
    this.change.emit();
  }

  public delete() {
    this.state = 'waiting';
    this.fileExplorer.nativeElement.value = null;
    this.uploaderService.removeFromQueue(this.storagePath, this.fileName);
    this.form?.setValue('');
    this.change.emit();
  }

  private computeState() {
    if (!!this.form.value) {
      this.state = 'file';
      this.fileName = this.form.value;
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.input);
      if (!!retrieved) {
        this.state = 'ready';
        this.fileName = retrieved.fileName;
        this.localSize = computeSize(retrieved.file.size);
      } else {
        this.state = 'waiting';
      }
    }
  }
}
