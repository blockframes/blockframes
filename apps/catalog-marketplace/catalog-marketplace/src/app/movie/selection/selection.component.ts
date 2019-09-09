import { BasketQuery } from '../../distribution-right/+state/basket.query';
import { ChangeDetectionStrategy } from '@angular/core';
import { MovieData, DistributionRight } from '../../distribution-right/+state/basket.model';
import { Component, OnInit } from '@angular/core';
import { staticModels, MovieQuery } from '@blockframes/movie';
import { FormControl } from '@angular/forms';
import { BasketService } from '../../distribution-right/+state/basket.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSelectionComponent implements OnInit {
  public priceControl: FormControl = new FormControl(null);
  public currencyList: string[];
  public selectedCurrency: string;
  public movieDistributionRights: MovieData;

  constructor(
    private basketService: BasketService,
    private movieQuery: MovieQuery,
    private basketQuery: BasketQuery
  ) {}
  ngOnInit() {
    this.currencyList = staticModels['MOVIE_CURRENCIES'].map(key => key.slug);
/*     this.basketQuery.distributionRight.subscribe(right => {
      this.movieDistributionRights = this.createRightDetail(right)
    }; */
    console.log(this.basketQuery.getAll())
    console.log(this.basketQuery.selectActive())
  }
  // TTHERE IS NO ACTIVE STATE CAUSE WE ARE FILTERING IT WITH THE QUERY, SEE THE GURAD FOR EXAMPLE

  private createRightDetail(detail: DistributionRight) {
    return {
      id: detail.id,
      movieName: this.getMovieTitle(detail.movieId),
      territory: detail.territories[0],
      rights: detail.medias[0],
      endRights: (detail.duration as any).to.toDate().toDateString(),
      languages: detail.languages[0],
      dubbed: detail.dubbings[0],
      subtitle: detail.subtitles[0]
    } as MovieData;
  }

  private getMovieTitle(id: string): string {
    const movieLookup = this.movieQuery.getAll().find(movie => movie.id === id);
    return movieLookup.main.title.international;
  }

  public deleteDistributionRight(rightId: string) {
/*     this.basketService.removeRight(rightId); */
  }

  public setPriceCurrency() {
    console.log('not implemented yet, modeling not clear');
  }
}
