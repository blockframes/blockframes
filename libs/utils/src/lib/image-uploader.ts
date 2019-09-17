import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

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
  public async uploadImageToFirestore(imageUrl: string, afPath: string = 'movies'): Promise<string> {
    try {
      const data = await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
      const snapshot = await this.afStorage.upload(`${afPath}/${imageUrl.split('/')[imageUrl.split('/').length - 1]}`, data)
      return snapshot.ref.getDownloadURL();
    } catch (error) {
      return;
    }
  }

}
