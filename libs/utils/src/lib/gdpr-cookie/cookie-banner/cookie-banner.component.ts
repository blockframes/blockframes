import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// Material
import { MatDialog } from '@angular/material/dialog';
// Blockframes
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
import { CookieDialogComponent } from '../cookie-dialog/cookie-dialog.component';
import { GDPRService } from '../gdpr-service/gdpr.service'
import { AuthService } from '@blockframes/auth/+state';

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
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) { }

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
    this.gdpr.enableIntercom(this.authService.profile, true);
    // this.gdpr.enableYandex(true); #7936 this may be reactivated later
    this.gdpr.enableHotjar(true);
  }

  public changePreferences() {
    const dialogRef = this.dialog.open(CookieDialogComponent, { maxHeight: '80vh', maxWidth: '80vw' });
    dialogRef.afterClosed().subscribe(settings => {
      if (settings) {
        this.confirmCookies();
        this.gdpr.enableIntercom(this.authService.profile, settings.intercom);
        // this.gdpr.enableYandex(settings.yandex); #7936 this may be reactivated later
        this.gdpr.enableHotjar(settings.hotjar);
      }
    })
  }

  confirmCookies() {
    // A max-age of 31536000 equals one year
    this.document.cookie = 'blockframes=; path=/; max-age=31536000';
    this.hasAccepted = true;
    this.cdr.markForCheck();
  }

}
