import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

// Material
import { MatDialog } from '@angular/material/dialog';

// Blockframes
import { CookieDialogComponent } from '../cookie-dialog/cookie-dialog.component';
import { GDPRService } from '../gdpr-service/gdpr.service'
import { AuthService } from '@blockframes/auth/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

@Component({
  selector: 'cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieBannerComponent implements OnInit {

  public hasAccepted = false;
  public form = new UntypedFormGroup({
    hotjar: new UntypedFormControl(true),
    intercom: new UntypedFormControl(true),
  });

  private appFamily = this.app === 'waterfall' ? 'Blockframes' : 'Archipel';
  public essentialCookies = $localize`Essential cookies are necessary for ${this.appFamily} products to function as intended.`;
  public analyticsCookies = $localize`Analytical cookies help us to improve ${this.appFamily} products by collecting and reporting information on their usage.`;
  public chatCookies = $localize`Chat cookies are used to allow the ${this.appFamily} team to communicate with its users through the chatbot tool.`;

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private gdpr: GDPRService,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(APP) private app: App
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
