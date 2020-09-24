import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionComponent implements OnInit {

  public movie$ = this.shell.movie$;
  public keys = [
    'stakeholders.productionCompany',
    'stakeholders.coProductionCompany',
    'stakeholders.distributor',
    'stakeholders.saleAgent',
    'producers'
  ]

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Artistic Info');
  }

}
