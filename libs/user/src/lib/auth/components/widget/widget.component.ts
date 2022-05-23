import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { dbVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';
import { OrganizationService } from '@blockframes/organization/+state';
import { IVersionDoc } from '@blockframes/model';
import { DocumentReference } from 'firebase/firestore';
import { firstValueFrom, map } from 'rxjs';
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
  isBfAdmin = firstValueFrom(this.authService.isBlockframesAdmin$); 
  appVersion$ = fromRef(this.firestoreService.getRef(dbVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data()));
  emulatorList = Object.keys(emulators).filter(key => !!emulators[key]);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none'

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private firestoreService: FirestoreService,
    private themeService: ThemeService
  ) { }

  public async logout() {
    await this.authService.signout();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
