import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';

import { DOCUMENT } from '@angular/common';

/** This is black magic from stack-overflow to detect if the browser is Safari or not.
 * Here we can not rely on `navigator.userAgent` because other Browser like Chromium put "Safari"
 * in there userAgent.
 * More details about the code below here : https://stackoverflow.com/a/9851769
*/
function isSafari() {
  return /constructor/i.test(window.HTMLElement as any) ||
    (
      function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      }
    )(
      !window['safari'] ||
      // @ts-ignore
      (typeof safari !== 'undefined' && safari.pushNotification)
    );
}

@Component({
  selector: 'safari-banner',
  templateUrl: './safari-banner.component.html',
  styleUrls: ['./safari-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SafariBannerComponent implements OnInit {

  public isHidden = true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    if (isSafari()) {
      const cookieString = this.document.cookie;
      const cookies = cookieString.split(';');
      const cookieNames = cookies.map(cookie => cookie.split('=')[0].trim());
      this.isHidden = cookieNames.some(cookieName => cookieName === 'archipel_safari');
    }
  }

  public userDismiss() {
    this.document.cookie = 'archipel_safari=true';
    this.isHidden = true;
  }
}
