import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DropZoneDirective } from '../drop-zone.directive'
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { zoom, zoomDelay, check, finalZoom } from '@blockframes/utils/animations/cropper-animations';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';

type CropStep = 'drop' | 'crop' | 'upload' | 'upload_complete' | 'show';

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


/** Check if the path is a file path */
function isFile(path: string): boolean {
  if (!path) {
    return false;
  }
  const part = path.split('.');
  const last = part.pop();
  return part.length === 1 && !last.includes('/');
}

@Component({
  selector: 'cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  viewProviders: [DropZoneDirective],
  animations: [ zoom, zoomDelay, check, finalZoom ]
})
export class CropperComponent {
  private ref: AngularFireStorageReference;
  private folder: string;
  private name: string;
  file: File;
  croppedImage: string;
  step: CropStep = 'drop';
  prev: CropStep;
  url$: Observable<string | null>;
  percentage$: Observable<number>;

  // inputs
  @Input() ratio: string;
  @Input() set path(path: string) {
    if (isFile(path)) {
      const part = path.split('/');
      this.name = part.pop();
      this.folder = part.pop();
      this.ref = this.storage.ref(path);
      this.url$ = this.ref.getDownloadURL();
      this.nextStep('show');
    } else {
      this.folder = path;
      this.nextStep('drop');
    }
  }

  @Output() uploaded = new EventEmitter<string>();
  @Output() deleted = new EventEmitter<string>();

  constructor(private storage: AngularFireStorage) { }

  // drop
  filesSelected(fileList: FileList): void {
    this.file = fileList[0];
    this.nextStep('crop');
  }

  // crop
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  delete() {
    this.ref.delete().subscribe(() => {
      this.nextStep('drop');
      this.deleted.emit(); // TODO : add path as parameter
    });
  }

  goToShow() {
    this.url$ = this.ref.getDownloadURL();
    this.ref.getMetadata().toPromise()
    .then(meta => this.uploaded.emit(meta.fullPath));
  }

  // upload
  cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet');
      }
      this.nextStep('upload');
      const fileName = this.name || this.file.name;
      this.ref = this.storage.ref(`${this.folder}/${fileName}`);
      const blob = b64toBlob(this.croppedImage);
      this.percentage$ = this.ref.put(blob).percentageChanges().pipe(
        finalize(() => this.nextStep('upload_complete'))
      );
    } catch (err) {
      console.log(err);
    }
  }

  nextStep(name: CropStep) {
    this.prev = this.step;
    this.step = name;
  }
}

