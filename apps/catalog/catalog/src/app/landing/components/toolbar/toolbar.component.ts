import { Component, ChangeDetectionStrategy, Input, HostListener } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'catalog-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogToolbarComponent {

  @Input() sidenav: MatSidenav;
  public setBackground = false;

  /** Change the toolbar class when page is scrolled. */
  @HostListener('window:scroll')
    scrollHandler() {
      this.setBackground = window.pageYOffset > 0;
    }
}
