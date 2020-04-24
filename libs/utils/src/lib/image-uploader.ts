import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sanitizeFileName } from "./file-sanitizer";

export interface ImgRef {
  urls: {
    original: string,
    xs?: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string
  };
  refs: {
    original: string,
    xs?: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string
  };
}

export function createImgRef(ref: Partial<ImgRef> | string = {}): ImgRef {
  const _ref = typeof ref === 'string' ? { url: ref, originalFileName: ref } : ref;
  return {
    urls: {
      original: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: ''
    },
    refs: {
      original: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: ''
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
      return createImgRef({ urls: { original: url }, refs: { original: meta.fullPath} });
    } catch (error) {
      return;
    }
  }

}
