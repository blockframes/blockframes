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

    // Get the first head element
    const head = this.document.getElementsByTagName('head')[0];
    // Create a script tag
    const script = document.createElement('script');
    // Specify the id for easily get back the script tag if needed
    script.id = 'hotjar-script';
    // Specify the type
    script.type = 'text/javascript';
    // Implement the function
    script.textContent = `(function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjarId},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`

    // Append script tag into the head
    const insetScriptTag = () => head.appendChild(script);
    // Fix for Opera browser
    if (window['opera'] === '[object Opera]') {
      this.document.addEventListener('DOMContentLoaded', insetScriptTag, false);
    } else {
      insetScriptTag();
    }
  }
}
