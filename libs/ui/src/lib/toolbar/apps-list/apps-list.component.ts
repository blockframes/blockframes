import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AFM_DISABLE } from '@env';
import { AppDetails, APPS_DETAILS } from '@blockframes/utils/apps';

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
