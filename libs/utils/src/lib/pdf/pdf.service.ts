import { Inject, Injectable } from '@angular/core';
import { App, appName } from '@blockframes/model';
import { firebaseRegion, firebase } from '@env';
import { EmulatorsConfig, EMULATORS_CONFIG } from '../emulator-front-setup';
import { APP } from '../routes/utils';
import { PdfParams } from './pdf.interfaces';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';

export const { projectId } = firebase();

interface DownloadSettings {
  titleIds: string[],
  pageTitle?: string,
  orgId?: string,
}

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(
    @Inject(APP) private app: App,
    @Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig
  ) { }

  async download(settings: DownloadSettings) {
    const app = this.app;
    const data: PdfParams = { app, ...settings };

    const fileName = data.pageTitle ? sanitizeFileName(`titles-export-${data.pageTitle}.pdf`) : `titles-export-${appName[app]}.pdf`;

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
          element.setAttribute('download', fileName);
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        });
    });

  }
}