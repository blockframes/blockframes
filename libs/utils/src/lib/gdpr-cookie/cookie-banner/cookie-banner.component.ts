import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// Material
import { MatDialog } from '@angular/material/dialog';
// Blockframes
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
import { CookieDialogComponent } from '../cookie-dialog/cookie-dialog.component';
import { GDPRService } from '../gdpr-service/gdpr.service'

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
    private cdr: ChangeDetectorRef,
    private gdpr: GDPRService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const cookieString = this.document.cookie;
    const cookies = cookieString.split(';');
    const cookieNames = cookies.map(cookie => cookie.split('=').shift()?.trim());
    this.hasAccepted = cookieNames.some(cookieName => cookieName === 'blockframes');
  }

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyComponent, { maxHeight: '80vh' })
  }

  public acceptCookies() {
    this.confirmCookies();
    this.gdpr.enableIntercom(true);
    this.gdpr.enableAnalytics(true);
    this.gdpr.enableYandex(true);
  }

  public changePreferences() {
    const dialogRef = this.dialog.open(CookieDialogComponent, { maxHeight: '80vh', maxWidth: '80vw' });
    dialogRef.afterClosed().subscribe(settings => {
      if (!!settings) {
        this.confirmCookies();
        this.gdpr.enableAnalytics(settings.googleAnalytics);
        this.gdpr.enableIntercom(settings.intercom);
        this.gdpr.enableYandex(settings.yandex);
      }
    })
  }

  confirmCookies() {
    this.document.cookie = 'blockframes=';
    this.hasAccepted = true;
    this.cdr.markForCheck();
  }

}
