import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { APPS_DETAILS, AppDetails } from '@blockframes/utils';

@Component({
  selector: 'toolbar-catalog-left-menu',
  templateUrl: './catalog-left-menu.component.html',
  styleUrls: ['./catalog-left-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLeftMenuComponent {
  @Input() sidenav: MatSidenav;
  public apps: AppDetails[] = APPS_DETAILS;
}
