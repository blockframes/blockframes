import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isSafari } from '../browser/utils';

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
    // A max-age of 31536000 equals one year
    this.document.cookie = 'archipel_safari=true; path=/; max-age=31536000';
    this.isHidden = true;
  }
}
