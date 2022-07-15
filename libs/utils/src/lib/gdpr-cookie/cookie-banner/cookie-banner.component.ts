import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// Material
import { MatDialog } from '@angular/material/dialog';
// Blockframes
import { CookieDialogComponent } from '../cookie-dialog/cookie-dialog.component';
import { GDPRService } from '../gdpr-service/gdpr.service'
import { AuthService } from '@blockframes/auth/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieBannerComponent implements OnInit {

  public hasAccepted = false;
  public form = new FormGroup({
    hotjar: new FormControl(true),
    intercom: new FormControl(true),
  });

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

  public openCookieModal() {
    const dialogRef = this.dialog.open(CookieDialogComponent, { data: createModalData({}, 'large'), autoFocus: false });
    dialogRef.afterClosed().subscribe(settings => {
      if (settings) {
        this.confirmCookies();
        this.gdpr.enableIntercom(this.authService.profile, settings.intercom);
        // this.gdpr.enableYandex(settings.yandex); #7936 this may be reactivated later
        this.gdpr.enableHotjar(settings.hotjar);
      }
    })
  }

  public saveCookies() {
    this.confirmCookies();
    const { hotjar, intercom } = this.form.value
    this.gdpr.enableHotjar(hotjar);
    this.gdpr.enableIntercom(this.authService.profile, intercom);
    // this.gdpr.enableYandex(true); #7936 this may be reactivated later
  }


  confirmCookies() {
    // A max-age of 31536000 equals one year
    this.document.cookie = 'blockframes=; path=/; max-age=31536000';
    this.hasAccepted = true;
    this.cdr.markForCheck();
  }

}
