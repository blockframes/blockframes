import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../service';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { OrganizationService } from '@blockframes/organization/service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent implements OnInit {
  user$ = this.authService.profile$;
  organization$ = this.orgService.currentOrg$;
  theme$ = this.themeService.theme$;
  canSwitchTheme = true;

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private themeService: ThemeService,
    @Inject(APP) private currentApp: App
  ) { }

  ngOnInit() {
    if(this.currentApp === 'waterfall') {
      this.themeService.setTheme('light');
      this.canSwitchTheme = false;
    };
  }

  public async logout() {
    await this.authService.signout();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
