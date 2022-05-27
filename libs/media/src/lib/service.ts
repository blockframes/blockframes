// Angular
import { Injectable } from '@angular/core';
import { CallableFunctions } from 'ngfire';

// State
import { StorageFile } from '@blockframes/model';
import { ImageParameters, getImgSize, getImgIxResourceUrl } from './image/directives/imgix-helpers';

// Blockframes
import { clamp } from '@blockframes/model';
@Injectable({ providedIn: 'root' })
export class MediaService {

  private breakpoints = [600, 1024, 1440, 1920];

  /**
   * This https callable method will check if current user asking for the media
   * have the rights to do so.
   * @dev protected resources are stored the same way than other resources but in the "protected" directory.
   * For example
   * @param ref (without "/protected")
   * @param parametersSet ImageParameters[]
   */
  getProtectedMediaToken = this.functions.prepare<{ file: StorageFile, parametersSet: ImageParameters[], eventId?: string }, string[]>('getMediaToken');

  constructor(private functions: CallableFunctions) { }

  async generateImageSrcset(file: StorageFile, _parameters: ImageParameters): Promise<string> {
    const parametersSet: ImageParameters[] = getImgSize(file.storagePath).map(size => ({ ..._parameters, w: size }));
    let tokens: string[] = [];

    if (file.privacy === 'protected') {
      tokens = await this.getProtectedMediaToken({ file, parametersSet });
    }

    const urls = parametersSet.map((param, index) => {
      if (tokens[index]) { param.s = tokens[index] };
      return `${getImgIxResourceUrl(file, param)} ${param.w}w`;
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
      const [token] = await this.getProtectedMediaToken({ file, parametersSet: [parameters], eventId });
      parameters.s = token;
    }

    return getImgIxResourceUrl(file, parameters);
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
