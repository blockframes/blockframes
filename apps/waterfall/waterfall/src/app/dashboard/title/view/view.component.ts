import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouteDescription } from '@blockframes/model';

@Component({
  selector: 'waterfall-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent {

  navLinks: RouteDescription[] = [
    {
      path: 'dashboard',
      label: 'Dashboard',
    },
    {
      path: 'statements',
      label: 'Statements',
      shouldHide: true,
    },
    {
      path: 'documents',
      label: 'Documents',
    },
    {
      path: 'waterfall',
      label: 'Waterfall',
      shouldHide: true,
    },
    {
      path: 'right-holders',
      label: 'Right Holders',
    },
    {
      path: 'sales',
      label: 'World Sales',
      shouldHide: true,
    },
  ];

}
