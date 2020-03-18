// Angular
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { algolia } from '@env';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  searchCtrl: FormControl = new FormControl('');

  ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies

  constructor(
    private breakpointsService: BreakpointsService) { }
}
