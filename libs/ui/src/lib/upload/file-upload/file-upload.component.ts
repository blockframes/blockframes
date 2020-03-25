import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sanitizeFileName, getMimeType } from '@blockframes/utils/file-sanitizer';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  /** use in the html to specify the input, ex: ['.json', '.png'] */
  @Input() public accept: string[];
  /** mime type, ex: ['image/png', 'application/json'] */
  @Input() public types: string[];
  /** should we upload the file to firestore */
  @Input() public uploadOnFirestore = false;
  /** firestore path */
  @Input() public path: string;
  /** Define what will be emited by storeUploaded event */
  @Input() public return = 'string'; // string | imgRef
  /** emit the current file as a Uint8Array */
  @Output() public uploaded = new EventEmitter<Uint8Array>();
  /** event emited when the firestore upload is complete */
  @Output() public storeUploaded = new EventEmitter<string | ImgRef>();

  public task: AngularFireUploadTask;
  public percentage: Observable<number>;
  public downloadURL: string;
  public state: 'waiting' | 'hovering' | 'uploading' | 'success' = 'waiting';


  constructor(private afStorage: AngularFireStorage, private snackBar: MatSnackBar) { }

  @HostListener('drop', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDrop($event: any) {
    $event.preventDefault();
    this.upload($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDragOver($event: any) {
    $event.preventDefault();
    this.state = 'hovering';
  }

  @HostListener('dragleave', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDragLeave($event: any) {
    $event.preventDefault();
    this.state = 'waiting';
  }

  public async upload(files: FileList) {
    if (!files.item(0)) {
      this.snackBar.open('No file found', 'close', { duration: 1000 });
      this.state = 'waiting';
      return;
    }

    const file = files.item(0);

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

    if (this.uploadOnFirestore) {
      const storagePath = `${this.path}/${sanitizeFileName(file.name)}`;
      this.task = this.afStorage.upload(storagePath, file);

      // Progress monitoring
      this.state = 'uploading';
      this.percentage = this.task.percentageChanges();

      const snapshot = await this.task;

      // Success
      this.state = 'success';
      this.downloadURL = await snapshot.ref.getDownloadURL();

      if (this.return === 'string') {
        this.storeUploaded.emit(this.downloadURL);
      } else {
        this.storeUploaded.emit(createImgRef({ url: this.downloadURL, originalFileName: file.name }));
      }
    }

    const reader = new FileReader();
    reader.addEventListener('loadend', _ => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      this.uploaded.emit(buffer);
    });
    reader.readAsArrayBuffer(file);
  }
}
