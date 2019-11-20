import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sanitizeFileName } from "./file-sanitizer";

export interface ImgRef {
  url: string;
  ref: string;
  originalRef: string
}

export function createImgRef(ref: Partial<ImgRef> = {}): ImgRef {
  return {
    url: '',
    ref: '',
    originalRef: '',
    ...ref
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
  public async upload(imageUrl: string, afPath: string = 'movies'): Promise<ImgRef|undefined> {
    try {
      const data = await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
      const snapshot = await this.afStorage.upload(`${afPath}/${sanitizeFileName(imageUrl)}`, data)
      const url = await snapshot.ref.getDownloadURL();
      const meta = await snapshot.ref.getMetadata();
      return { url, ref: meta.fullPath, originalRef: '' };
    } catch (error) {
      return ;
    }
  }

}
