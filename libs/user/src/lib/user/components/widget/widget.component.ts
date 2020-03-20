import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService, AuthQuery } from '@blockframes/auth';
import { ThemeService } from '@blockframes/ui/theme';
import { OrganizationQuery } from '@blockframes/organization';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'account-user-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserWidgetComponent {
  user$ = this.query.user$;
  organization$ = this.organizationQuery.selectActive();
  theme$ = this.themeService.theme$;

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private themeService: ThemeService,
  ){}


  public async logout() {
    await this.service.signOut();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
