import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { dbVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';
import { OrganizationService } from '@blockframes/organization/+state';
import { IVersionDoc } from '@blockframes/model';
import { DocumentReference } from 'firebase/firestore';
import { map } from 'rxjs';
import { FirestoreService, fromRef } from 'ngfire';

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
  appVersion$ = fromRef(this.firestore.getRef(dbVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data()));
  emulatorList = Object.keys(emulators).filter(key => !!emulators[key]);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none'

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private firestore: FirestoreService,
    private themeService: ThemeService,
    private userService: UserService
  ) { }

  public async logout() {
    await this.authService.signout();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
