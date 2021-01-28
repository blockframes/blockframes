import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { NotificationSettings } from '@blockframes/user/+state/user.model';
import { getCurrentApp } from "@blockframes/utils/apps";

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  @Input() form: NotificationsForm;
  selectAllEmail = false;
  selectAllApp = false;
  currentApp: string = getCurrentApp(this.routerQuery);

  constructor(private routerQuery: RouterQuery) { }

  toogleDefault(event: MatSlideToggleChange) {
    this.form.get('default').get(event.source.name as keyof NotificationSettings).setValue(event.checked);
  }

  selectAll(event: MatSlideToggleChange) {
    if (event.source.name === 'selectAllEmail') this.selectAllEmail = event.checked;
    if (event.source.name === 'selectAllApp') this.selectAllApp = event.checked;
  }

}
