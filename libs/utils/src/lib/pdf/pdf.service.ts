import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { firebaseRegion, firebase, emulators } from '@env';
import { appName, getCurrentApp } from "./../apps";
import { PdfParams } from "./pdf.interfaces";
export const { projectId } = firebase();

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(
    private routerQuery: RouterQuery,
    private http: HttpClient
  ) { }

  async download(titleIds: string[]) {
    const app = getCurrentApp(this.routerQuery);
    const params: PdfParams = {
      titleIds,
      app
    };

    const url = emulators.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`

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