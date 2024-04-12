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
      requireKeys: ['admin']
    },
    {
      path: 'statements',
      label: 'Statements',
      requireKeys: ['waterfall-ready']
    },
    {
      path: 'documents',
      label: 'Documents'
    },
    {
      path: 'waterfall',
      label: 'Waterfall',
      requireKeys: ['waterfall-ready']
    },
    {
      path: 'right-holders',
      label: 'Right Holders',
    },
    {
      path: 'sales',
      label: 'World Sales',
      requireKeys: ['waterfall-ready', 'admin']
    },
  ];

}
