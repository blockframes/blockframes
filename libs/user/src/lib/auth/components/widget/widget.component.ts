import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent {
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
    /**
     * the databases function seems to be not typed
     * in typescript node.
     */
    const dbKeys = await (window.indexedDB as any).databases();
    for (const key of dbKeys) {
      indexedDB.deleteDatabase(key.name);
    }
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
