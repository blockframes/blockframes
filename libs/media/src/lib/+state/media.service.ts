// Angular
import { Injectable, Injector } from "@angular/core";
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";

// State
import { isValidMetadata } from "./media.model";
import { OldUploadData, StorageFile } from "./media.firestore";
import { UploadWidgetComponent } from "../file/upload-widget/upload-widget.component";
import { ImageParameters, getImgSize, getImgIxResourceUrl } from '../image/directives/imgix-helpers';

// Blockframes
import { clamp } from '@blockframes/utils/utils';
import { delay } from "@blockframes/utils/helpers";
import { AuthQuery } from "@blockframes/auth/+state";
import { BehaviorStore } from '@blockframes/utils/behavior-store';
import { tempUploadDir } from "@blockframes/utils/file-sanitizer";

@Injectable({ providedIn: 'root' })
export class MediaService {

  private _tasks = new BehaviorStore<AngularFireUploadTask[]>([]);

  private breakpoints = [600, 1024, 1440, 1920];

  private overlayOptions = {
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  public overlayRef: OverlayRef;
  private getMediaToken = this.functions.httpsCallable('getMediaToken');

  constructor(
    private userQuery: AuthQuery,
    private storage: AngularFireStorage,
    private functions: AngularFireFunctions,
    private overlay: Overlay,
    private db: AngularFirestore
  ) { }

  async upload(uploadFiles: OldUploadData | OldUploadData[]) {
    const files = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];
    /**
     * @dev Every file goes into tmp dir.
     * Then a backend functions performs a check on DB document to check if
     * file have to be moved to correct folder or deleted.
     */
    const tasks = files.map(file => this.storage.upload(`${tempUploadDir}/${file.path}/${file.fileName}`, file.data, { customMetadata: file.metadata }));
    this.addTasks(tasks);
    (Promise as any).allSettled(tasks)
      .then(() => delay(3000))
      .then(() => this.detachWidget());
    this.showWidget();
  }

  private addTasks(tasks: AngularFireUploadTask[]) {
    const t = this._tasks.value;
    t.push(...tasks);
    this._tasks.value = t
  }

  private detachWidget() {
    if (!this.overlayRef) return;

    const canClose = this._tasks.value.every(task => task.task.snapshot.state === 'success');
    if (canClose) {
      this.overlayRef.detach();
      delete this.overlayRef;
      const tasks = this._tasks.value.filter(task => task.task.snapshot.state !== 'success');
      this._tasks.value = tasks;
    }
  }

  private async showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      const instance = new ComponentPortal(UploadWidgetComponent);
      instance.injector = Injector.create({ providers: [{ provide: 'tasks', useValue: this._tasks }, { provide: 'db', useValue: this.db }] });
      this.overlayRef.attach(instance);
    }
  }

  uploadMedias(mediaForms: any[]) {
    mediaForms.forEach(mediaForm => {
      if (!!mediaForm.blobOrFile) {

        const isValid = isValidMetadata(mediaForm.metadata);
        if (!isValid) {
          console.error('Invalid File Metadata: upload of this file will be skipped!');
          console.error(mediaForm);
          return; // skip the current `forEach` iteration
        }

        // upload the new file
        this.upload({
          data: mediaForm.blobOrFile,
          path: mediaForm.ref,
          fileName: mediaForm.fileName,
          metadata: {
            uid: this.userQuery.userId,
            privacy: mediaForm.metadata.privacy,
            collection: mediaForm.metadata.collection,
            docId: mediaForm.metadata.docId,
            field: mediaForm.metadata.field,
          },
        });

      }
    });
  }

  /**
   * This https callable method will check if current user asking for the media
   * have the rights to do so.
   * @dev protected resources are stored the same way than other resources but in the "protected" directory.
   * For example
   * @param ref (without "/protected")
   * @param parametersSet ImageParameters[]
   */
  private async getProtectedMediaToken(file: StorageFile, parametersSet: ImageParameters[], eventId?: string): Promise<string[]> {
    return this.getMediaToken({ file, parametersSet, eventId }).toPromise();
  }

  async generateImageSrcset(file: StorageFile, _parameters: ImageParameters): Promise<string> {
    const params: ImageParameters[] = getImgSize(file.storagePath).map(size => ({ ..._parameters, w: size }));
    let tokens: string[] = [];

    if (file.privacy === 'protected') {
      tokens = await this.getProtectedMediaToken(file, params);
    }

    const urls = params.map((param, index) => {
      if (tokens[index]) { param.s = tokens[index] };
      return `${getImgIxResourceUrl(file.storagePath, param)} ${param.w}w`;
    })

    return urls.join(', ');
  }

  /**
   * generateImgIxUrl : Generate a ImgIx URL
   * @param ref string
   * @param parameters ImageParameters
   */
  async generateImgIxUrl(file: StorageFile, parameters: ImageParameters = {}, eventId?: string): Promise<string> {
      if (file.privacy === 'protected') {
      const [token] = await this.getProtectedMediaToken(file, [parameters], eventId);
      parameters.s = token;
    }

    return getImgIxResourceUrl(file.storagePath, parameters);
  }

  generateBackgroundImageUrl(file: StorageFile, p: ImageParameters): Promise<string> {

    // default client width
    let clientWidth = 1024;

    if (!!window || !!window.innerWidth) {
      clientWidth = clamp(window.innerWidth, this.breakpoints);
    }

    // Math.min(n, undefined) = Nan,
    // to prevent that we use Infinity to pick clientWidth if parameters.width is undefined
    p.w = Math.min(clientWidth, p.w || Infinity);

    return this.generateImgIxUrl(file, p);
  }

}
