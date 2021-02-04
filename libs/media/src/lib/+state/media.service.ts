// Angular
import { Injectable, Injector } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AngularFireFunctions } from "@angular/fire/functions";
import { AngularFirestore } from "@angular/fire/firestore";

// State
import { OldUploadData, HostedMediaFormValue } from "./media.firestore";
import { isValidMetadata } from "./media.model";

// Blockframes
import { UploadWidgetComponent } from "../file/upload-widget/upload-widget.component";
import { delay, BehaviorStore } from "@blockframes/utils/helpers";
import { ImageParameters, getImgSize, getImgIxResourceUrl } from '../image/directives/imgix-helpers';
import { clamp } from '@blockframes/utils/utils';
import { tempUploadDir, privacies, Privacy } from "@blockframes/utils/file-sanitizer";
import { AuthQuery } from "@blockframes/auth/+state";

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

  uploadMedias(mediaForms: HostedMediaFormValue[]) {
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
  private async getProtectedMediaToken(docRef: string, field: string, parametersSet: ImageParameters[], eventId?: string): Promise<string[]> {
    return this.getMediaToken({ docRef, field, parametersSet, eventId }).toPromise();
  }

  async generateImageSrcset(storagePath: string, docRef: string, field: string, _parameters: ImageParameters): Promise<string> {

    const privacy = storagePath.split('/').filter(part => !!part).shift() as Privacy;
    const params: ImageParameters[] = getImgSize(field).map(size => ({ ..._parameters, w: size }));
    let tokens: string[] = [];

    if (privacies.includes(privacy)) {
      if (privacy === 'protected') {
        tokens = await this.getProtectedMediaToken(docRef, field, params);
      }
    }

    const urls = params.map((param, index) => {
      if (tokens[index]) { param.s = tokens[index] };
      return `${getImgIxResourceUrl(storagePath, param)} ${param.w}w`;
    })

    return urls.join(', ');
  }

  /**
   * generateImgIxUrl : Generate a ImgIx URL
   * @param ref string
   * @param parameters ImageParameters
   */
  async generateImgIxUrl(storagePath: string, docRef: string, field: string, parameters: ImageParameters = {}, eventId?: string): Promise<string> {

    if (!storagePath) return '';

    const parts = storagePath.split('/').filter(part => !!part)
    const privacy = parts.shift() as Privacy;

    if (privacy === 'protected') {
      const [token] = await this.getProtectedMediaToken(docRef, field, [parameters], eventId);
      parameters.s = token;
    }

    return getImgIxResourceUrl(storagePath, parameters);
  }

  async generateBackgroundImageUrl(storagePath: string, docRef: string, field: string, p: ImageParameters): Promise<string> {

    // default client width
    let clientWidth = 1024;

    if (!!window || !!window.innerWidth) {
      clientWidth = clamp(window.innerWidth, this.breakpoints);
    }

    // Math.min(n, undefined) = Nan,
    // to prevent that we use Infinity to pick clientWidth if parameters.width is undefined
    p.w = Math.min(clientWidth, p.w || Infinity);

    return this.generateImgIxUrl(storagePath, docRef, field, p);
  }

}
