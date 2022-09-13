import { Inject, Injectable } from '@angular/core';
import { App, appName } from '@blockframes/model';
import { firebaseRegion, firebase } from '@env';
import { EmulatorsConfig, EMULATORS_CONFIG } from '../emulator-front-setup';
import { APP } from '../routes/utils';
import { PdfParams } from './pdf.interfaces';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { ModuleGuard } from '../routes/module.guard';

export const { projectId } = firebase();

interface DownloadSettings {
  titleIds: string[],
  pageTitle?: string,
  orgId?: string,
}

@Injectable({ providedIn: 'root' })
export class PdfService {

  /**
   * Firebase functions only allow a max size of 10mb for http requests
   * @see https://firebase.google.com/docs/functions/quotas#resource_limits
   * So we need to add a maximum of movies that can be exported to PDF.
   */
  public exportLimit = 450;

  constructor(
    private moduleGuard: ModuleGuard,
    @Inject(APP) private app: App,
    @Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig
  ) { }

  async download(settings: DownloadSettings) {
    const app = this.app;
    const module = this.moduleGuard.currentModule;
    const data: PdfParams = { app, module, ...settings };

    const fileName = data.pageTitle || appName[app];

    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }

    const url = this.emulatorsConfig.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`

    const status = await new Promise(resolve => {
      fetch(url, params,).then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', sanitizeFileName(`${fileName}.pdf`));
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        }).catch(_ => resolve(false));
    });

    return status as boolean;
  }
}