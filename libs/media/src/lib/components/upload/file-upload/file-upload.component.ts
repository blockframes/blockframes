import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  getMimeType,
  getStoragePath,
  sanitizeFileName,
  Privacy,
} from '@blockframes/utils/file-sanitizer';
import { getFileNameFromPath } from '@blockframes/media/+state/media.model';
import { Subscription } from 'rxjs';
import { HostedMediaFormValue } from '@blockframes/media/+state/media.firestore';
import { allowedFiles, AllowedFileType } from '@blockframes/utils/utils';

type UploadState = 'waiting' | 'hovering' | 'ready' | 'file';

@Component({
  selector: '[form] [storagePath] file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements OnInit, OnDestroy {
  /** firestore path */
  @Input() storagePath: string;
  @Input() form: HostedMediaForm;
  @Input() filePrivacy: Privacy = 'public';
  @Input() set allowedFileType(fileType: AllowedFileType | AllowedFileType[]) {
    const types = Array.isArray(fileType) ? fileType : [fileType]
    types.forEach(type => {
      this.accept = this.accept.concat(allowedFiles[type].extension);
      this.types = this.types.concat(allowedFiles[type].mime);
    })
  }

  @ContentChild('onReady') onReadyTemplate: TemplateRef<any>;
  @ContentChild('onFile') onFileTemplate: TemplateRef<any>;

  public accept: string[] = [];
  public types: string[] = [];

  public localSize: string;
  public state: UploadState = 'waiting';

  private sub: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    // show current file when component loads
    if (!!this.form.blobOrFile.value) {
      this.selected(this.form.blobOrFile.value);
    } else if (!!this.form.oldRef?.value) {
      this.state = 'file';
    }

    this.sub = this.form.valueChanges.subscribe((value: HostedMediaFormValue) => this.setState(value));
  }

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
    this.setState(this.form.value);
  }

  public setState(value: HostedMediaFormValue) {
    let newState: UploadState;

    if (!!value.blobOrFile && !!value.ref && !!value.fileName) {
      newState = 'ready';
    } else if (!!value.oldRef && !!value.fileName && !!value.ref) {
      newState = 'file';
    } else {
      newState = 'waiting';
    }
    this.state = newState;
    this.cdr.markForCheck();
  }

  public selected(files: FileList | File) {

    let file: File;
    if ('item' in files) {
      if (!files.item(0)) {
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        this.state = !!this.form.oldRef.value ? 'file' : 'waiting';
        return;
      }
      file = files.item(0);
    } else {
      if (!files) {
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        this.state = !!this.form.oldRef.value ? 'file' : 'waiting';
        return;
      }
      file = files;
    }

    const fileType = getMimeType(file);

    // Hack around cypress issue with Files and events,
    // See https://github.com/cypress-io/cypress/issues/3613
    if (!(file instanceof File)) {
      // @ts-ignore
      file.__proto__ = new File([], fileType);
    }

    const isFileTypeValid = this.types && this.types.includes(fileType);
    if (!isFileTypeValid) {
      this.snackBar.open(`Unsupported file type: "${fileType}".`, 'close', { duration: 1000 });
      this.state = 'waiting';
      return;
    }

    const size = file.size / 1000;
    if (size < 1000) {
      this.localSize = `${size.toFixed(1)} KB`;
    } else if (size < 1000 * 1000) {
      this.localSize = `${(size / 1000).toFixed(1)} MB`;
    } else {
      this.localSize = `${(size / (1000 * 1000)).toFixed(1)} GB`;
    }

    this.form.patchValue({
      ref: getStoragePath(this.storagePath, this.filePrivacy),
      blobOrFile: file,
      fileName: sanitizeFileName(file.name),
    });
    this.form.markAsDirty();
  }

  public delete(fileExplorer: HTMLInputElement) {
    this.form.patchValue({
      ref: '',
      blobOrFile: undefined,
      fileName: !!this.form.oldRef.value ? getFileNameFromPath(this.form.oldRef.value) : '',
    });
    this.form.markAsDirty();

    fileExplorer.value = null;
  }
}
