import {
  Component,
  Input,
  HostListener,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sanitizeFileName, getMimeType } from '@blockframes/utils/file-sanitizer';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UploadState } from '../unload.model';

/**
 * This function prevent the user to reload the page or to navigate away.
 *
 * It used by `window.addEventListener` to handle the `beforeunload` event.
 * @note This needs to be a named function in order to be removable by `removeEventListener`.
 * @note This function tried to be cross browser compatible, but do not expect consistent results.
 * For example Chrome doesn't show any custom message to the user.
 */
function unloadHandler(e: Event) {
  e.preventDefault();
  // some browser needs this
  (e.returnValue as any) = 'Leaving the page will stop the upload of your file, are you sure ?';
  return 'Leaving the page will stop the upload of your file, are you sure ?';
}

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit {
  /** use in the html to specify the input, ex: ['.json', '.png'] */
  @Input() public accept: string[];
  /** mime type, ex: ['image/png', 'application/json'] */
  @Input() public types: string[];
  /** should we upload the file to firestore */
  public _uploadOnFirestore: boolean;
  @Input()
  get uploadOnFirestore() { return this._uploadOnFirestore; }
  set uploadOnFirestore(value: boolean) {
    this._uploadOnFirestore = coerceBooleanProperty(value);
  }
  /** firestore path */
  @Input() public path: string;
  /** Define what will be emitted by storeUploaded event */
  @Input() public return = 'string'; // string | imgRef
  /** emit the current file as a Uint8Array */
  @Output() public uploaded = new EventEmitter<Uint8Array>();
  /** event emitted when the firestore upload is complete */
  @Output() public storeUploaded = new EventEmitter<string | ImgRef>();
  /** event emitted when the upload state change */
  @Output() public stateChanged = new EventEmitter<UploadState>();

  /** Should we prevent teh user to leave until the end of upload ? */
  public _blocking: boolean;
  @Input()
  get blocking() { return this._uploadOnFirestore; }
  set blocking(value: boolean) {
    this._blocking = coerceBooleanProperty(value);
  }

  public task: AngularFireUploadTask;
  public percentage: Observable<number>;
  public downloadURL: string;
  public state: UploadState = 'waiting';

  constructor(
    private afStorage: AngularFireStorage,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.stateChanged.emit(this.state);
  }

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
    this.stateChanged.emit(this.state);
  }

  @HostListener('dragleave', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDragLeave($event: any) {
    $event.preventDefault();
    this.state = 'waiting';
    this.stateChanged.emit(this.state);
  }

  public async upload(files: FileList) {
    if (!files.item(0)) {
      this.snackBar.open('No file found', 'close', { duration: 1000 });
      this.state = 'waiting';
      this.stateChanged.emit(this.state);
      return;
    }

    // (only) if the upload is blocking we should prevent the user to leave the page
    // be sure that the `window` object exists beforehand
    // ! note that will not prevent the user to navigate away in the app, this is the job of the `../unload.guard.ts`
    if (this.blocking && !!window) {
      window.addEventListener('beforeunload', unloadHandler);
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
      this.stateChanged.emit(this.state);
      return;
    }

    if (this.uploadOnFirestore) {
      const storagePath = `${this.path}/${sanitizeFileName(file.name)}`;
      this.task = this.afStorage.upload(storagePath, file);

      // Progress monitoring
      this.state = 'uploading';
      this.stateChanged.emit(this.state);
      this.percentage = this.task.percentageChanges();

      try {
        console.log('A'); // TODO remove debug log
        const snapshot = await this.task;
        console.log('B'); // TODO remove debug log

        // Success
        this.state = 'success';
        this.stateChanged.emit(this.state);
        this.downloadURL = await snapshot.ref.getDownloadURL();

        if (this.return === 'string') {
          this.storeUploaded.emit(this.downloadURL);
        } else {
          this.storeUploaded.emit(createImgRef({ urls: { original: this.downloadURL } }));
        }
      } catch (error) {

        // TODO for some reasons this catch is triggered during upload cancel
        // TODO but the exception is still thrown to the ErrorHandler snack bar
        console.log('FAILURE', error); // TODO remove debug log

        // the user has canceled the upload or an error as happened

        // reset component state, so it can accept new uploads
        this.state = 'waiting';
        this.stateChanged.emit(this.state);

        // we should re allow the user to leave -> remove the `beforeunload` handler
        // be sure that the `window` object exists beforehand
        if (this.blocking && !!window) {
          window.removeEventListener('beforeunload', unloadHandler);
        }

        // if it's not 'storage/canceled' then it's a "real" error
        if (error.code !== 'storage/canceled') {
          throw error;
        }
      }
    }

    console.log('keep going'); // TODO remove debug log

    // TODO DO WE REALLY WANT TO HOLD AN ENTIRE MOVIE IN THE RAM ?
    // ! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (this.state === 'uploading' || this.state === 'success') {
      const reader = new FileReader();
      reader.addEventListener('loadend', _ => {
        console.log('yeaaaaaaah') // TODO remove debug log
        const buffer = new Uint8Array(reader.result as ArrayBuffer);
        this.uploaded.emit(buffer);
        console.log('murica!'); // TODO remove debug log
      });
      reader.readAsArrayBuffer(file);
      console.log('maybe'); // TODO remove debug log
    }

    // the upload is finished, so we should re allow the user to leave -> remove the `beforeunload` handler
    // be sure that the `window` object exists beforehand
    if (this.blocking && !!window) {
      window.removeEventListener('beforeunload', unloadHandler);
    }

    console.log('nope'); // TODO remove debug log
  }
}
