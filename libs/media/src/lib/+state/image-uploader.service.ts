import { Injectable } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { createImgRef, ImgRef } from "./media.model";
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';

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
      console.error(`Upload fail because of`, error);
      return;
    }
  }

}