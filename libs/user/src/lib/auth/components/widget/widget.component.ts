import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../service';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { OrganizationService } from '@blockframes/organization/service';
import { APP } from '@blockframes/utils/routes/utils';
import { App, SupportedLanguages, getISO3166TerritoryFromSlug, getUserLocaleId, preferredLanguage, supportedLanguages } from '@blockframes/model';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent implements OnInit, OnDestroy {
  user$ = this.authService.profile$;
  organization$ = this.orgService.currentOrg$;
  theme$ = this.themeService.theme$;
  canSwitchTheme = true;
  canSwitchLanguage = false;
  defaultLang: SupportedLanguages = preferredLanguage();
  langControl = new FormControl<SupportedLanguages>(this.defaultLang);
  supportedLanguages = supportedLanguages;
  private sub: Subscription;

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private themeService: ThemeService,
    @Inject(APP) private currentApp: App
  ) { }

  async ngOnInit() {
    if (this.currentApp === 'waterfall') {
      this.themeService.setTheme('light');
      this.canSwitchTheme = false;
      this.canSwitchLanguage = true;

      // get user organization territory
      const org = this.orgService.org;
      const territory = org?.addresses?.main?.country;
      const iso3166 = territory ? getISO3166TerritoryFromSlug(territory) : undefined;

      // save default language in user settings
      const user = this.authService.profile;
      if (!user.settings?.preferredLanguage && this.defaultLang) {
        const defaultLocaleId = getUserLocaleId();
        const userLocaleId = await this.authService.updatePreferredLanguage(this.defaultLang, iso3166?.iso_a2, false);
        if (defaultLocaleId !== userLocaleId) window.location.reload();
      } else if (user.settings?.preferredLanguage) {
        const dbSettings = user.settings.preferredLanguage;
        const localSettings = `${localStorage.getItem('locale.lang')}-${localStorage.getItem('locale.isoA2')}`
        if (localSettings !== `${dbSettings.language}-${dbSettings.isoA2}`) {
          localStorage.setItem('locale.lang', dbSettings.language);
          localStorage.setItem('locale.isoA2', dbSettings.isoA2);
          window.location.reload();
        }
      }

      // update user language
      this.sub = this.langControl.valueChanges.subscribe(async lang => {
        await this.authService.updatePreferredLanguage(lang, iso3166?.iso_a2);
      });
    };
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public async logout() {
    await this.authService.signout();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
