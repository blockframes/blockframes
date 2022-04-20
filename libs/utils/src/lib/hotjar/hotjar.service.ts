import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import { hotjar } from '@env';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class HotjarService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: unknown
  ) {}

  public insertHotjar(app: App) {
    const hotjarId = hotjar[app];

    if (!isPlatformBrowser(this.platformId) || !hotjarId) return;
    if (this.document.getElementById('hotjar-script')) return;

    const head = this.document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.id = 'hotjar-script';
    script.type = 'text/javascript';
    script.textContent = `(function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjarId},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`

    const insetScriptTag = () => head.appendChild(script);
    if (window['opera'] === '[object Opera]') {
      this.document.addEventListener('DOMContentLoaded', insetScriptTag, false);
    } else {
      insetScriptTag();
    }
  }
}
