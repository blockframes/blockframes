import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisticComponent implements OnInit {

  public movie$ = this.shell.movie$;

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Artistic Info');
  }

}
