
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
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  getMimeType,
  sanitizeFileName,
} from '@blockframes/utils/file-sanitizer';
import { FileUploaderService } from '@blockframes/media/+state';
import { FileMetaData } from '@blockframes/media/+state/media.firestore';
import { allowedFiles, AllowedFileType } from '@blockframes/utils/utils';
import { FormControl } from '@angular/forms';

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
  selector: '[storagePath] [metadata] [allowedFileType] file-new-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent implements OnInit { // }, OnDestroy {
  /**
   * This the *storage* path, **not** the db path!
   * @note it **should not** start with `tmp/`
   * @note it **should not** start with a `/`
   * @note it **should not** end with a `/`
   * @example 'protected/movie/1234/poster'
   */
  @Input() storagePath: string;

  @Input() metadata: FileMetaData;

  @Input() displayFile: FormControl;

  @Input() input: number;

  @Input() set allowedFileType(fileType: AllowedFileType | AllowedFileType[]) {
    const types = Array.isArray(fileType) ? fileType : [fileType]
    types.forEach(type => {
      this.accept = this.accept.concat(allowedFiles[type].extension);
      this.types = this.types.concat(allowedFiles[type].mime);
    })
  }
  public accept: string[] = [];
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

    console.log(this.displayFile); // TODO REMOVE DEBUG LOG

    if (!!this.displayFile.value) {
      this.state = 'file';
      this.fileName = this.displayFile.value;
    } else {
      const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.input);
      if (!!retrieved) {
      this.state = 'ready';
      this.fileName = retrieved.fileName;
      this.localSize = computeSize(retrieved.file.size);
      }
    }

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
    this.state = 'waiting';
  }


  public selected(files: FileList | File) {

    console.log('selected', files); // TODO REMOVE DEBUG LOG

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

    } else { // Single File
      if (!files) {
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        if (!!this.file) {
          this.state = 'file';
        } else {
          this.state = 'waiting';
          this.fileExplorer.nativeElement.value = null;
        }
        return;
      }
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

    this.uploaderService.addToQueue(this.storagePath, this.fileName, this.file, this.metadata);
  }

  public delete() {
    this.state = 'waiting';
    this.fileExplorer.nativeElement.value = null;
    this.uploaderService.removeFromQueue(this.storagePath, this.fileName);
    this.displayFile?.setValue('');
  }
}
