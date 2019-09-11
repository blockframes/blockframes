import { AngularFireStorage } from "@angular/fire/storage";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class HttpUpload {

  constructor(
    private afStorage: AngularFireStorage,
    private httpClient: HttpClient,
  ) { }

  public getImage(imageUrl: string): Promise<Blob | boolean> {
    if (imageUrl) {
      return this.httpClient
        .get(imageUrl, { responseType: 'blob' })
        .toPromise()
        .catch(_ => new Promise((resolve) => resolve(false)))
    } else {
      return new Promise((resolve) => resolve(false));
    }
  }

  public async uploadImageToFirestore(imageUrl: string, afPath: string = 'movies'): Promise<string> {
    const data = await this.getImage(imageUrl);
    if (data !== false) {
      const snapshot = await this.afStorage.upload(`${afPath}/${imageUrl.split('/')[imageUrl.split('/').length - 1]}`, data)
      const url = await snapshot.ref.getDownloadURL();
      return url;
    } else {
      return;
    }
  }

}
