import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sanitizeFileName } from "./file-sanitizer";

export interface ImgRef {
  ref: string;
  urls: {
    original: string,
    xs?: string,
    md?: string,
    lg?: string
  };
}

export function createImgRef(ref: Partial<ImgRef> | string = {}): ImgRef {
  const _ref = typeof ref === 'string' ? { urls: { original : ref } } : ref;
  return {
    ref: '',
    urls: {
      original: '',
      xs: '',
      md: '',
      lg: ''
    },
    ..._ref
  };
}

@Injectable({ providedIn: 'root' })
export class ImageUploader {

  constructor(
    private afStorage: AngularFireStorage,
    private httpClient: HttpClient,
  ) { }

  /**
   * Fetchs a remote image and uploads it to firestore
   * @param imageUrl
   * @param afPath
   */
  public async upload(imageUrl: string, afPath: string = 'movies'): Promise<ImgRef | undefined> {
    try {
      const data = await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
      const snapshot = await this.afStorage.upload(`${afPath}/${sanitizeFileName(imageUrl)}`, data);
      const url = await snapshot.ref.getDownloadURL();
      const meta = await snapshot.ref.getMetadata();
      return createImgRef({ urls: { original: url }, ref: meta.fullPath });
    } catch (error) {
      return;
    }
  }

}
