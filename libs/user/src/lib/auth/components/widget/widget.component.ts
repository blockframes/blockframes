import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AuthService } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { dbVersionDoc } from '@blockframes/utils/maintenance';
import { OrganizationService } from '@blockframes/organization/+state';
import { IVersionDoc } from '@blockframes/model';
import { DocumentReference } from 'firebase/firestore';
import { map } from 'rxjs';
import { FirestoreService, fromRef } from 'ngfire';
import { EMULATORS_CONFIG, EmulatorsConfig } from '@blockframes/utils/emulator-front-setup';

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
  appVersion$ = fromRef(this.firestoreService.getRef(dbVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data()));
  emulatorList = Object.keys(this.emulatorsConfig);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none';

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private firestoreService: FirestoreService,
    private themeService: ThemeService,
    private userService: UserService,
    @Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig
  ) { }

  public async logout() {
    await this.authService.signout();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
