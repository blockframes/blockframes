import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sanitizeFileName } from "./file-sanitizer";
import { FormGroup, FormControl } from "@angular/forms";

export interface ImgRef {
  urls: {
    original: string,
    xs?: string,
    md?: string,
    lg?: string
  };
  refs: {
    original: string,
    xs?: string,
    md?: string,
    lg?: string
  };
}

export function createImgRef(ref: Partial<ImgRef> | string = {}): ImgRef {
  const _ref = typeof ref === 'string' ? { url: ref, originalFileName: ref } : ref;
  return {
    urls: {
      original: '',
      xs: '',
      md: '',
      lg: ''
    },
    refs: {
      original: '',
      xs: '',
      md: '',
      lg: ''
    },
    ..._ref
  };
}

export function createImgRefForm(reference?: Partial<ImgRef>) {
  const { urls, refs } = createImgRef(reference);
  return {
    urls: new FormGroup({
      original: new FormControl(urls.original),
      xs: new FormControl(urls.xs),
      md: new FormControl(urls.md),
      lg: new FormControl(urls.lg)
    }),
    refs: new FormGroup({
      original: new FormControl(refs.original),
      xs: new FormControl(refs.xs),
      md: new FormControl(refs.md),
      lg: new FormControl(refs.lg)
    }),
  }
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
