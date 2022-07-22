import { Inject, Injectable } from '@angular/core';
import { App, appName } from '@blockframes/model';
import { firebaseRegion, firebase } from '@env';
import { EmulatorsConfig, EMULATORS_CONFIG } from '../emulator-front-setup';
import { APP } from '../routes/utils';
import { PdfParams } from './pdf.interfaces';

export const { projectId } = firebase();

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(
    @Inject(APP) private app: App,
    @Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig
  ) { }

  async download(titleIds: string[], pageTitle?: string) {
    const app = this.app;
    const data: PdfParams = {
      titleIds,
      app,
      pageTitle
    };

    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }

    const url = this.emulatorsConfig.functions
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