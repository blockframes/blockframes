import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// Material
import { MatDialog } from '@angular/material/dialog';
// Blockframes
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
import { CookieFormComponent } from '../cookie-form/cookie-form.component';
import { GDPRService } from '../gdpr-service/gdpr.service'
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { YandexMetricaService, YM_CONFIG } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';

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
    private gdpr: GDPRService,
    private analytics: FireAnalytics,
    private intercom: IntercomService,
    private yandex: YandexMetricaService,
    @Inject(YM_CONFIG) private ymConfig: number,
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
    this.enableIntercom();
    this.enableAnalytics();
    this.enableYandex();
  }

  public changePreferences() {
    const dialogRef = this.dialog.open(CookieFormComponent, { maxHeight: '80vh', maxWidth: '80vw' });
    dialogRef.afterClosed().subscribe(settings => {
      if (!!settings) {
        this.confirmCookies();
        if (settings.google) this.enableAnalytics();
        if (settings.intercom) this.enableIntercom();
        if (settings.yandex) this.enableYandex();
      }
    })
  }

  confirmCookies() {
    this.document.cookie = 'blockframes=';
    this.hasAccepted = true;
  }

  enableIntercom() {
    this.gdpr.enable('intercom', true);
    this.intercom.enable();
  }

  enableAnalytics() {
    this.gdpr.enable('googleAnalytics', true);
    this.analytics.analytics.setAnalyticsCollectionEnabled(true);
  }

  enableYandex() {
    this.gdpr.enable('yandex', true);
    this.yandex.insertMetrika(this.ymConfig);
  }

}
