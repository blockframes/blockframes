import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AuthService } from '../../service';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { dbVersionDoc } from '@blockframes/utils/maintenance';
import { OrganizationService } from '@blockframes/organization/+state';
import { IVersionDoc } from '@blockframes/model';
import { DocumentReference } from 'firebase/firestore';
import { firstValueFrom, map } from 'rxjs';
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
  isBfAdmin = firstValueFrom(this.authService.isBlockframesAdmin$); 
  appVersion$ = fromRef(this.firestore.getRef(dbVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data()));
  emulatorList = Object.keys(this.emulatorsConfig);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none';

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private firestore: FirestoreService,
    private themeService: ThemeService,
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
