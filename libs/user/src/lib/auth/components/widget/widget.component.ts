import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { dbVersionDoc, IVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent {
  user$ = this.service.profile$;
  organization$ = this.orgService.org$;
  theme$ = this.themeService.theme$;
  isBfAdmin = this.userService.isBlockframesAdmin(this.service.profile.uid);
  appVersion$ = this.db.doc<IVersionDoc>(dbVersionDoc).valueChanges();
  emulatorList = Object.keys(emulators).filter(key => !!emulators[key]);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none'

  constructor(
    private db: AngularFirestore,
    private service: AuthService,
    private orgService: OrganizationService,
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
}
