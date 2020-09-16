import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getMimeType, getStoragePath, sanitizeFileName, Privacy } from '@blockframes/utils/file-sanitizer';
import { getFileNameFromPath } from '@blockframes/media/+state/media.model';
import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: '[form] [storagePath] file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit {
  /** use in the html to specify the input, ex: ['.json', '.png'] */
  @Input() public accept: string[];
  /** mime type, ex: ['image/png', 'application/json'] */
  @Input() public types: string[];
  /** firestore path */
  @Input() storagePath: string;
  @Input() form: HostedMediaForm;
  @Input() filePrivacy : Privacy = 'public';

  public localSize: string;
  public state: 'waiting' | 'hovering' | 'ready' | 'file' = 'waiting';

  constructor(private snackBar: MatSnackBar, private storage: AngularFireStorage) { }

  ngOnInit() {
    // show current file
    if (!!this.form.blobOrFile.value) {
      this.selected(this.form.blobOrFile.value);
    } else if (!!this.form.oldRef?.value) {
      this.state = 'file';
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

    let file;
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
      file = files
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

    const size = (file.size / 1000);
    if (size < 1000) {
      this.localSize = `${size.toFixed(1)} KB`;
    } else {
      this.localSize = `${(size / 100).toFixed(1)} MB`;
    }
    this.state = 'ready';

    this.form.patchValue({
      ref: getStoragePath(this.storagePath, this.filePrivacy),
      blobOrFile: file,
      delete: false,
      fileName: sanitizeFileName(file.name),
    })
    this.form.markAsDirty();
  }

  public delete() {
    this.state = 'waiting';
    this.form.patchValue({ delete: true });
    this.form.markAsDirty();
  }

  public reset(fileExplorer: HTMLInputElement) {

    this.form.patchValue({
      blobOrFile: undefined,
      delete: false,
      fileName: !!this.form.oldRef.value ? getFileNameFromPath(this.form.oldRef.value) : '',
    })
    this.form.markAsDirty();

    fileExplorer.value = null;

    this.state = !!this.form.oldRef.value ? 'file' : 'waiting';
  }
}
