import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { firebaseRegion, firebase, emulators } from '@env';
import { appName, getCurrentApp } from "./../apps";
import { PdfParams } from "./pdf.interfaces";
export const { projectId } = firebase();

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(
    private route: ActivatedRoute
  ) { }

  async download(titleIds: string[]) {
    const app = getCurrentApp(this.route);
    const data: PdfParams = {
      titleIds,
      app
    };

    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }

    const url = emulators.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`

    await new Promise(resolve => {
      fetch(url, params,).then(res => res.blob())
        .then(blob => {
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