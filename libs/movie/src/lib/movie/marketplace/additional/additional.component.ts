import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalComponent implements OnInit {

  public movie$ = this.shell.movie$;
  public keys = {
    formats: ['format', 'formatQuality', 'color', 'soundFormat']
  };

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Financing Conditions');
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

  public hasBudget({ boxOffice, rating, certifications, review}: Movie): boolean {
    return !!(
      boxOffice.length ||
      certifications.length ||
      rating.length ||
      review.length
    )
  }

}
