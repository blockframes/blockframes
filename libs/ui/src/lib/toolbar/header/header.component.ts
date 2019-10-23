import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { AFM_DISABLE } from '@env';

@Component({
  selector: 'toolbar-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  @Input() sidenav: MatSidenav
  public AFM_DISABLE: boolean;

  constructor() {
    this.AFM_DISABLE = AFM_DISABLE;
  }
}
