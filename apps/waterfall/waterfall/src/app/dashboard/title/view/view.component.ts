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
      label: 'Dashboard'
    },
    {
      path: 'statements',
      label: 'Statements'
    },
    {
      path: 'documents',
      label: 'Documents'
    },
    {
      path: 'waterfall',
      label: 'Waterfall',
    },
    {
      path: 'sales',
      label: 'World Sales',
    },
  ];

}
