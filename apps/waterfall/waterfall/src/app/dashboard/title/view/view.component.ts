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
      label: $localize`Dashboard`,
      requireKeys: ['admin']
    },
    {
      path: 'statements',
      label: $localize`Statements`,
      requireKeys: ['waterfall-ready']
    },
    {
      path: 'documents',
      label: $localize`Documents`
    },
    {
      path: 'waterfall',
      label: $localize`Waterfall`,
      requireKeys: ['waterfall-ready']
    },
    {
      path: 'amortization',
      label: $localize`Film Amortization`,
      requireKeys: ['admin']
    },
    {
      path: 'right-holders',
      label: $localize`Right Holders`,
    },
    {
      path: 'sales',
      label: $localize`World Sales`,
      requireKeys: ['waterfall-ready', 'admin']
    },
  ];

}
