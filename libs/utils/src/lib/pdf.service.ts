import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { getImgIxResourceUrl } from "@blockframes/media/image/directives/imgix-helpers";
import { toStorageFile } from "@blockframes/media/pipes/storageFile.pipe";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { firebaseRegion, firebase } from '@env';
import { AlgoliaMovie } from "./algolia";
import { appName, getCurrentApp } from "./apps";
export const { projectId } = firebase();

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(
    private routerQuery: RouterQuery,
    private http: HttpClient
  ) { }

  async download(movies: AlgoliaMovie[]) {
    const app = getCurrentApp(this.routerQuery);
    const params = {
      titlesData: movies.map(m => {
        const storageFile = toStorageFile(m.poster, 'movies', 'poster', m.objectID);
        const posterUrl = getImgIxResourceUrl(storageFile, { h: 240, w: 180 });
        return {
          id: m.objectID,
          posterUrl
        };
      }),
      app
    };

    // @dev if using emulator, use `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`
    const url = `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`;

    await new Promise(resolve => {
      this.http.post(url, params, { responseType: 'arraybuffer' })
        .toPromise().then(response => {
          const type = 'application/pdf';
          const buffer = new Uint8Array(response);
          const blob = new Blob([buffer], { type });
          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', `titles-export-${appName[app]}.pdf`);
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        });
    });

  }
}