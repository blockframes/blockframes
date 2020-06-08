import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieBannerComponent implements OnInit {

  public hasAccepted = false;

  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    const cookieString = this.document.cookie;
    const cookies = cookieString.split(';');
    const cookieNames = cookies.map(cookie => cookie.split('=')[0].trim());
    this.hasAccepted = cookieNames.some(cookieName => cookieName === 'archipel');
  }

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyComponent, { maxHeight: '80vh' })
  }

  public userAcceptedCookies() {
    this.document.cookie = 'archipel=true';
    this.hasAccepted = true;
  }
}
