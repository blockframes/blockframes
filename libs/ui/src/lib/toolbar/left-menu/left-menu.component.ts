import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AppDetails, APPS_DETAILS } from '@blockframes/utils/apps';

@Component({
  selector: 'toolbar-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeftMenuComponent {
  @Input() sidenav: MatSidenav;
  public apps: AppDetails[] = APPS_DETAILS;
}
