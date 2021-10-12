import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { ThemeService } from '@blockframes/ui/theme';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '@blockframes/user/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { dbVersionDoc, IVersionDoc } from '@blockframes/utils/maintenance';
import { emulators } from '@env';
import type firebase from 'firebase';

@Component({
  selector: 'auth-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthWidgetComponent implements OnInit {
  user$ = this.query.user$;
  organization$ = this.organizationQuery.selectActive();
  theme$ = this.themeService.theme$;
  isBfAdmin = this.userService.isBlockframesAdmin(this.query.getValue().uid);
  appVersion$ = this.db.doc<IVersionDoc>(dbVersionDoc).valueChanges();
  emulatorList = Object.keys(emulators).filter(key => !!emulators[key]);
  emulators = this.emulatorList.length ? this.emulatorList.join(' - ') : 'none';
  anonymousUser: firebase.User;

  constructor(
    private db: AngularFirestore,
    private service: AuthService,
    private query: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private themeService: ThemeService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  public async ngOnInit() {
    const currentUser = await this.service.auth.currentUser;
    if (currentUser.isAnonymous) {
      this.anonymousUser = currentUser;
      this.cdr.markForCheck();
    }
  }

  public async logout() {
    await this.service.deleteAnonymousUserOrSignOut();
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
  }
}
