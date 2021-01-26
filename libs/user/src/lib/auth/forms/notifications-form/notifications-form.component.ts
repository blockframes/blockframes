import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { NotificationSettings } from '@blockframes/user/+state/user.model';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent implements OnInit, OnDestroy {

  @Input() form: NotificationsForm;

  public masterToggleStatus: 'accept' | 'reject' | 'other'
  private sub: Subscription;
  public appName;

  constructor(private routerQuery: RouterQuery) { }

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(startWith(this.form.value)).subscribe(data => {
      const allAccepted = Object.keys(data).every(key => data[key]);
      const allRejected = Object.keys(data).every(key => !data[key]);
      this.masterToggleStatus = allAccepted ? 'accept' : allRejected ? 'reject' : 'other';
    })
    this.appName = appName[getCurrentApp(this.routerQuery)];
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  masterToggle(event: MatRadioChange) {
    for (const key in this.form.controls) {
      this.form.get('default').get(key as keyof NotificationSettings).setValue(event.value);
    }
  }

  toggleCookie(event: MatSlideToggleChange) {
    this.form.get('default').get(event.source.name as keyof NotificationSettings).setValue(event.checked);
  }

}
