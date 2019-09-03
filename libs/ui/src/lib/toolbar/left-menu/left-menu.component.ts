import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Observable } from 'rxjs';
import { AppDetailsWithStatus, OrganizationQuery } from '@blockframes/organization';
import { APPS_DETAILS, AppDetails } from '@blockframes/utils';

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
