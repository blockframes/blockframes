import { Component, Input, forwardRef, Renderer2, ElementRef } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DropZoneDirective } from '../drop-zone.directive'
import { finalize, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { zoom, zoomDelay, check, finalZoom } from '@blockframes/utils/animations/cropper-animations';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
/*import { HttpClient } from '@angular/common/http';*/
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImgRef } from '@blockframes/utils/image-uploader';

type CropStep = 'drop' | 'crop' | 'upload' | 'upload_complete' | 'show';

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

/*function blobToFile(blob: Blob, fileName: string): File {
  const picture = new File([blob], fileName, { type: "image/png" })
  return picture;
}*/

/** Check if the path is a file path */
function isFile(imgRef: ImgRef): boolean {
  if (!imgRef || !imgRef.ref) {
    return false;
  }
  const part = imgRef.ref.split('.');
  const last = part.pop();
  return part.length >= 1 && !last.includes('/');
}

@Component({
  selector: 'drop-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  viewProviders: [DropZoneDirective],
  animations: [zoom, zoomDelay, check, finalZoom],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CropperComponent),
    multi: true
  }]
})
export class CropperComponent implements ControlValueAccessor {
  private ref: AngularFireStorageReference;
  private folder: string;
  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');
  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: string;
  parentWidth: number;
  prev: CropStep;
  url$: Observable<string | null>;
  percentage$: Observable<number>;

  // inputs
  @Input() set ratio(ratio: string) {
    this.cropRatio = ratio;
    const el: HTMLElement = this._elementRef.nativeElement;
    this.parentWidth = el.clientWidth;
    this._renderer.setStyle(el, "height", `calc(40px+${this.parentWidth}px/${ratio})`)
  }
  @Input() setWidth?: number;
  @Input() storagePath: string;
  /** Disable fileuploader & delete buttons in 'show' step */
  @Input() useFileuploader?= true;
  @Input() useDelete?= true;
  uploaded: (ref: ImgRef) => void;
  deleted: () => void;

  constructor(private storage: AngularFireStorage, /*private http: HttpClient,*/ private _renderer: Renderer2, private _elementRef: ElementRef) { }

  //////////////////////////
  // ControlValueAccessor //
  //////////////////////////

  //  Triggered when the parent form field is initialized or updated (parent -> component)
  writeValue(path: ImgRef): void {
    if (isFile(path)) {
      const part = path.ref.split('/');
      this.folder = this.storagePath;
      this.ref = this.storage.ref(path.ref);
      this.url$ = this.ref.getDownloadURL().pipe(
        catchError(err => {
          this.nextStep('drop');
          return of('');
        })
      )
      this.nextStep('show');
    } else {
      this.folder = this.storagePath;
      this.nextStep('drop');
    }
  }

  // update the parent form field when there is change in the component (component -> parent)
  registerOnChange(fn: any): void {
    this.uploaded = (ref: ImgRef) => fn(ref);
    this.deleted = () => fn({ url: '', ref: '', originalRef: '' });
  }

  registerOnTouched(fn: any): void {
    return;
  }

  ///////////
  // Steps //
  ///////////


  // drop
  filesSelected(fileList: FileList): void {
    this.file = fileList[0];
    // TODO#1149: fix resize - upload original picture
    // this.storage.ref(`${this.folder}/original`).put(this.file);
    this.nextStep('crop');
  }

  // crop
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  // upload
  cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet');
      }
      this.nextStep('upload');
      const part = this.file.name.split('.');
      const fileName = part[0] + Date.now() + '.' + part[1];
      this.ref = this.storage.ref(`${this.folder}/${fileName}`);
      const blob = b64toBlob(this.croppedImage);

      this.percentage$ = this.ref.put(blob).percentageChanges().pipe(
        finalize(() => {
          this.nextStep('upload_complete')
        })
      );
    } catch (err) {
      console.log(err);
    }
  }

  goToShow() {
    this.url$ = this.ref.getDownloadURL();
    // Observable completed once both requests are completed
    combineLatest([this.url$, this.ref.getMetadata()])
    .subscribe(([url, meta]) => {
      this.uploaded({
        url,
        ref: meta.fullPath,
        originalRef: ''
      });
      this.nextStep('show');
    })
  }

  // TODO#1149: fix resize - get original picture
  /*
  async resize(url: string) {
    if (!this.file) {
      // const name = url.split('%2F').pop();
      const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
      // this.file = blobToFile(blob, name);
      this.file = blobToFile(blob, 'original');
    }
    this.nextStep('crop');
  }
  */

  delete() {
    this.ref.delete().subscribe(() => {
      this.deleted()
      this.nextStep('drop');
    });
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }
}

