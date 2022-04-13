import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { doc, docData, DocumentReference, Firestore } from '@angular/fire/firestore';
import { dbVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';
import { OrganizationService } from '@blockframes/organization/+state';
import { IVersionDoc } from '@blockframes/model';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent {
  user$ = this.authService.profile$;
  organization$ = this.orgService.currentOrg$;
  theme$ = this.themeService.theme$;
  isBfAdmin = this.userService.isBlockframesAdmin(this.authService.uid);
  appVersion$ = docData<IVersionDoc>(doc(this.db, dbVersionDoc) as DocumentReference<IVersionDoc>);
  emulatorList = Object.keys(emulators).filter(key => !!emulators[key]);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none'

  constructor(
    private db: Firestore,
    private authService: AuthService,
    private orgService: OrganizationService,
    private themeService: ThemeService,
    private userService: UserService
  ) { }

  public async logout() {
    await this.authService.signOut();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
