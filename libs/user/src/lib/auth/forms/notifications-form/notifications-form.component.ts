import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { getCurrentApp } from "@blockframes/utils/apps";
import { NotificationType, notificationTypes } from '@blockframes/notification/types';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
//  Record<NotificationType, string>
const titleType = {
  requestFromUserToJoinOrgCreate: 'blabla',
  orgMemberUpdated: 'blabla',
  invitationFromUserToJoinOrgDecline: 'blabla'
};

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  public types = [...notificationTypes];
  public titleType = titleType;
  public tables = [
    {
      title: 'Company Management Notifications',
      types: ['requestFromUserToJoinOrgCreate', 'orgMemberUpdated', 'invitationFromUserToJoinOrgDecline']
    },

  ];

  currentApp: string = getCurrentApp(this.routerQuery);
  public form = new NotificationsForm(this.authQuery.user.settings?.notifications);

  constructor(
    private routerQuery: RouterQuery,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
    ) { }

  toogleAll(event: MatSlideToggleChange, mode: 'email' | 'app') {
    const checked = event.checked;
    for (const control of Object.values(this.form.controls)) {
      const c = control.get(mode);
      if(!c.disabled) c.setValue(checked);
    }
  }

  setAll(event: MatCheckboxChange, mode: 'email' | 'app', types: NotificationType[]) {
    const checked = event.checked;
    for (const type of types) {
      const c = this.form.get(type as any).get(mode);
      if(!c.disabled) c.setValue(checked);
    }
    this.cdr.markForCheck();
  }

  public async update() {
    const notifications = this.form.getRawValue();
    const uid = this.authQuery.userId;
    await this.authService.update({ uid, settings: { notifications } });

    this.snackBar.open('Notifications settings updated.', 'close', { duration: 2000 });
  }
}

@Pipe({name: 'someChecked'})
export class SomeCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationType[]) {
    let checked = 0;
    for (const type of types) {
      if (value[type]?.[mode]) checked ++;
    }
    return checked > 0 && checked < types.length;
  }
}

@Pipe({name: 'everyChecked'})
export class EveryCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationType[]) {
    return types.every(type => !!value[type]?.[mode]);
  }
}
