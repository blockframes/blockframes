// Angular
import { Injectable, Injector } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AngularFireFunctions } from "@angular/fire/functions";
import { AngularFirestore } from "@angular/fire/firestore";

// State
import { UploadData, HostedMediaFormValue } from "./media.firestore";

// Blockframes
import { UploadWidgetComponent } from "../components/upload/widget/upload-widget.component";
import { delay, BehaviorStore } from "@blockframes/utils/helpers";
import { ImageParameters, getImgSize, getImgIxResourceUrl } from "../directives/image-reference/imgix-helpers";
import { clamp } from '@blockframes/utils/utils';
import { tempUploadDir, privacies, Privacy } from "@blockframes/utils/file-sanitizer";

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
    private storage: AngularFireStorage,
    private functions: AngularFireFunctions,
    private overlay: Overlay,
    private db: AngularFirestore
  ) { }

  async upload(uploadFiles: UploadData | UploadData[]) {
    const files = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];
    /**
     * @dev Every file goes into tmp dir.
     * Then a backend functions performs a check on DB document to check if
     * file have to be moved to correct folder or deleted.
     */
    const tasks = files.map(file => this.storage.upload(`${tempUploadDir}/${file.path}/${file.fileName}`, file.data));
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

  async uploadMedias(mediaForms: HostedMediaFormValue[]) {
    const promises = mediaForms.map(async mediaForm => {
     if (!!mediaForm.blobOrFile) {
        // upload the new file
        this.upload({
          data: mediaForm.blobOrFile,
          path: mediaForm.ref,
          fileName: mediaForm.fileName
        });

      }
    });
    await Promise.all(promises);
  }

  /**
   * This https callable method will check if current user asking for the media
   * have the rights to do so.
   * @dev protected resources are stored the same way than other resources but in the "protected" directory.
   * For example
   * @param ref (without "/protected")
   * @param parametersSet ImageParameters[]
   */
  private async getProtectedMediaToken(ref: string, parametersSet: ImageParameters[]): Promise<string[]> {
    ref = !ref.startsWith('/') ? `/${ref}` : ref;
    return this.getMediaToken({ ref, parametersSet }).toPromise();
  }

  async generateImageSrcset(ref: string, _parameters: ImageParameters): Promise<string> {
    const refParts = ref.split('/');
    const privacy = refParts.shift() as Privacy;
    const params: ImageParameters[] = getImgSize(ref).map(size => ({ ..._parameters, w: size }));
    let tokens: string[] = [];

    if (privacies.includes(privacy)) {
      ref = refParts.join('/');
      if (privacy === 'protected') {
        tokens = await this.getProtectedMediaToken(ref, params);
      }
    }

    const urls = params.map((param, index) => {
      if (tokens[index]) { param.s = tokens[index] };
      return `${getImgIxResourceUrl(ref, param)} ${param.w}w`;
    })

    return urls.join(', ');
  }

  /**
   * generateImgIxUrl : Generate a ImgIx URL
   * @param ref string
   * @param parameters ImageParameters
   */
  async generateImgIxUrl(ref: string, parameters: ImageParameters = {}): Promise<string> {
    if (!ref) {
      return '';
    }
    ref = encodeURI(ref); // For accentuated files names

    const refParts = ref.split('/');
    const privacy = refParts.shift() as Privacy;

    if (privacies.includes(privacy)) {
      ref = refParts.join('/');
      if (privacy === 'protected') {
        const [token] = await this.getProtectedMediaToken(ref, [parameters]);
        parameters.s = token;
      }
    }

    return getImgIxResourceUrl(ref, parameters);
  }

  generateBackgroundImageUrl(ref: string, p: ImageParameters): Promise<string> {

    // default client width
    let clientWidth = 1024;

    if (!!window || !!window.innerWidth) {
      clientWidth = clamp(window.innerWidth, this.breakpoints);
    }

    // Math.min(n, undefined) = Nan,
    // to prevent that we use Infinity to pick clientWidth if parameters.width is undefined
    p.w = Math.min(clientWidth, p.w || Infinity);

    return this.generateImgIxUrl(ref, p);
  }

}
