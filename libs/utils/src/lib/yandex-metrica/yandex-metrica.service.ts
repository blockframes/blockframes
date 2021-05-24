import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import { yandex } from '@env';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class YandexMetricaService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: unknown
  ) {}

  public insertMetrika(app: App) {
    const yandexId = yandex[app];

    if (!isPlatformBrowser(this.platformId) || !yandexId) {
      return;
    }

    // Get the first head element
    const head = this.document.getElementsByTagName('head')[0];
    // Create a script tag
    const script = document.createElement('script');
    // Specify the id for easily get back the script tag if needed
    script.id = 'yandex-script'
    // Specify the type
    script.type = 'text/javascript';
    // Implement the function
    script.textContent = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${yandexId}, "init", {
             clickmap:true,
             trackLinks:true,
             accurateTrackBounce:true,
             webvisor:true
        });`;
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
