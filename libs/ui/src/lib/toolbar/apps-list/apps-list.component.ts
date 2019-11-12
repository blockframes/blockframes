import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { APPS_DETAILS, AppDetails } from '@blockframes/utils';
import { AFM_DISABLE } from '@env';

@Component({
  selector: 'toolbar-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsListComponent {
  @Input() sidenav: MatSidenav;
  public apps: AppDetails[] = APPS_DETAILS;
  public AFM_DISABLE = AFM_DISABLE;
}
