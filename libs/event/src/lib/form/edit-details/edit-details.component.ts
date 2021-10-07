import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EventForm } from '../event.form';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: '[form] event-details-edit',
  templateUrl: 'edit-details.component.html',
  styleUrls: ['./edit-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDetailsComponent {
  @Input() form: EventForm;
  @Input() displayPrivacySettings = false;
  appName: string =  appName[getCurrentApp(this.routerQuery)];
  
  constructor(private routerQuery: RouterQuery) {}

  onPrivacyChange(privacy) {
    this.form.value.accessibility = privacy;
  }
}