import { Injectable } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";

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
  //  TODO issue #3091
  // public async upload(imageUrl: string, afPath: string = 'movies'): Promise<ImgRef | undefined> {
  //   try {
  //     const data = await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
  //     const snapshot = await this.afStorage.upload(`${afPath}/${sanitizeFileName(imageUrl)}`, data);
  //     const url: string = await snapshot.ref.getDownloadURL();
  //     const meta: { fullPath: string} = await snapshot.ref.getMetadata();
  //     return createImgRef({ original: { ref: meta.fullPath, url }});
  //   } catch (error) {
  //     console.error(`Upload fail because of`, error);
  //     return;
  //   }
  // }

}
