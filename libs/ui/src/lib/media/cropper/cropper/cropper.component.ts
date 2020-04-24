import { Component, Input, forwardRef, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DropZoneDirective } from '../drop-zone.directive'
import { finalize, catchError, map } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, Subscription, combineLatest } from 'rxjs';
import { zoom, zoomDelay, check, finalZoom } from '@blockframes/utils/animations/cropper-animations';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
/*import { HttpClient } from '@angular/common/http';*/
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { storage as firebaseStorage } from 'firebase';
import { interval } from '@blockframes/utils/helpers';

type CropStep = 'drop' | 'crop' | 'upload' | 'upload_complete' | 'show';

const mediaRatio = {
  square: 1/1,
  banner: 16/9,
  poster: 3/4,
  still: 5/7
}

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
  if (!imgRef || !imgRef.refs) {
    return false;
  }
  const part = imgRef.refs.original.split('.');
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
export class CropperComponent implements ControlValueAccessor, OnDestroy {
  private refs: {
    original: AngularFireStorageReference,
    xs: AngularFireStorageReference,
    md: AngularFireStorageReference,
    lg: AngularFireStorageReference
  }
  private folder: string;
  private fileName: string;
  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');
  private sub = new Subscription;
  private sizes: {
    xs: number,
    md: number,
    lg: number
  };
  step$ = this.step.asObservable();
  file: File;
  croppedImage: string;
  cropRatio: string;
  parentWidth: number;
  prev: CropStep;
  urls: {
    original$: Observable<string | null>,
    xs$: Observable<string | null>,
    md$: Observable<string | null>,
    lg$: Observable<string | null>
  };
  percentage$: Observable<number>;
  resizing = false;

  // inputs
  @Input() set ratio(ratio: string) {
    if (!mediaRatio.hasOwnProperty(ratio)) {
      console.error(`"${ratio}" is not a valid ratio. Valid ratios are: ${Object.keys(mediaRatio).join(', ')}`);
    }
    this.cropRatio = mediaRatio[ratio];
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
      this.folder = this.storagePath;

      this.refs = {
        original: this.storage.ref(path.refs.original),
        xs: null,
        md: null,
        lg: null
      }

      this.urls = {
        original$: this.refs.original.getDownloadURL().pipe(
          catchError(err => {
            this.nextStep('drop');
            return of('');
          })
        ),
        xs$: null,
        md$: null,
        lg$: null
      }

      this.nextStep('show');
    } else {
      this.folder = this.storagePath;
      this.nextStep('drop');
    }

    // Define the different sizes of the images depending on their folder name
    if (this.folder === 'avatar' || this.folder === 'logo') {
      this.sizes = { xs: 50, md: 100, lg: 300 };
    } else if (this.folder.endsWith('poster')) {
      this.sizes = { xs: 200, md: 400, lg: 600 };
    } else if (this.folder.endsWith('banner')) {
      this.sizes = { xs: 300, md: 600, lg: 1200 };
    } else if (this.folder.endsWith('still')) {
      this.sizes = { xs: 50, md: 100, lg: 200 };
    } else {
      throw new Error('Folder is invalid');
    }
  }

  // update the parent form field when there is change in the component (component -> parent)
  registerOnChange(fn: any): void {
    this.uploaded = (ref: ImgRef) => fn(ref);
    this.deleted = () => fn(createImgRef());
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
  async cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet');
      }
      this.nextStep('upload');
      this.fileName = sanitizeFileName(this.file.name).replace(/(\.[\w\d_-]+)$/i, '.webp');
      this.refs = {
        original: this.storage.ref(`${this.folder}/${this.fileName}`),
        xs: null,
        md: null,
        lg: null
      }
      const blob = b64toBlob(this.croppedImage);

      this.percentage$ = this.refs.original.put(blob).percentageChanges().pipe(
        finalize(() => {
          this.nextStep('upload_complete')
        })
      );
    } catch (err) {
      console.log(err);
    }
  }

  async goToShow() {
    // TODO#2451: switch back to angularFire storage ref when bug on getMetadata() is fixed.
    this.resizing = true;
    // Since we got no simple solution to wait backend for resizing images, we need to wait.
    await interval(4000);
    this.resizing = false;

    this.refs = {
      ...this.refs,
      xs: this.storage.ref(this.resizedImgPath(this.sizes.xs)),
      md: this.storage.ref(this.resizedImgPath(this.sizes.md)),
      lg: this.storage.ref(this.resizedImgPath(this.sizes.lg))
    }

    const firebaseRefs = {
      original: firebaseStorage().ref(`${this.folder}/${this.fileName}`),
      xs: firebaseStorage().ref(this.resizedImgPath(this.sizes.xs)),
      md: firebaseStorage().ref(this.resizedImgPath(this.sizes.md)),
      lg: firebaseStorage().ref(this.resizedImgPath(this.sizes.lg)),
    }

    const metadatas = {
      original: await firebaseRefs.original.getMetadata(),
      xs: await firebaseRefs.xs.getMetadata(),
      md: await firebaseRefs.md.getMetadata(),
      lg: await firebaseRefs.lg.getMetadata(),
    }

    this.urls = {
      original$: this.getDownloadUrl(this.refs.original),
      xs$: this.getDownloadUrl(this.refs.xs),
      md$: this.getDownloadUrl(this.refs.md),
      lg$: this.getDownloadUrl(this.refs.lg),
    }

    this.sub = combineLatest(([
      this.urls.original$,
      this.urls.xs$,
      this.urls.md$,
      this.urls.lg$
    ])).pipe(
      map(([original, xs, md, lg]) => this.uploaded(createImgRef({
        urls: { original, xs, md, lg},
        refs: {
          original: metadatas.original.fullPath,
          xs: metadatas.xs.fullPath,
          md: metadatas.md.fullPath,
          lg: metadatas.lg.fullPath,
        }
      })))
    ).subscribe();

    this.nextStep('show');
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
    this.refs.original.delete().subscribe(() => {
      this.deleted()
      this.nextStep('drop');
    });
  }

  nextStep(name: CropStep) {
    this.prev = this.step.getValue();
    this.step.next(name);
  }

  /** Returns the path of a resized image */
  private resizedImgPath(size: number): string {
    return `${this.folder}/bf@${this.fileName.replace(/(\.[\w\d_-]+)$/i, `_${size}.webp`)}`
  }

  /** Returns an observable of the download url of an image based on its reference */
  private getDownloadUrl(ref: AngularFireStorageReference): Observable<string> {
    return ref.getDownloadURL().pipe(
      catchError(err => of(''))
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

