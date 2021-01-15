import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { dbVersionDoc, IVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';

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
  isBfAdmin = this.userService.isBlockframesAdmin(this.query.getValue().uid);
  appVersion$ = this.db.doc<IVersionDoc>(dbVersionDoc).valueChanges();

  constructor(
    private db: AngularFirestore,
    private service: AuthService,
    private query: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private themeService: ThemeService,
    private userService: UserService
  ) { }

  public async logout() {
    await this.service.signOut();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }

  getEmulators(): string {
    const enabledEmulators = [];
    Object.keys(emulators).forEach(k => {
      if (emulators[k]) {
        enabledEmulators.push(k);
      }
    });

    if (enabledEmulators.length) {
      return enabledEmulators.join(' - ');
    } else {
      return 'none';
    }
  }
}
