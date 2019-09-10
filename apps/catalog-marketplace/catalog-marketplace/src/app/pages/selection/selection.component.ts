import { ChangeDetectionStrategy } from '@angular/core';
import { MovieData, DistributionRight } from './../../distribution-right/+state/basket.model';
import { Component, OnInit } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { staticModels } from '@blockframes/movie';
import { FormControl } from '@angular/forms';
import { BasketService } from '../../distribution-right/+state/basket.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSelectionComponent implements OnInit {
  public movieDistributionRights: MovieData[];
  public priceControl: FormControl = new FormControl(null);
  public currencyList: string[];
  public selectedCurrency: string;

  constructor(
    private orgQuery: OrganizationQuery,
    private basketService: BasketService,
    private movieQuery: MovieQuery
  ) {}
  ngOnInit() {
    this.currencyList = staticModels['MOVIE_CURRENCIES'].map(key => key.slug);
    this.movieDistributionRights = this.orgQuery
      .getValue()
      .org.catalog.rights.map(right => this.createRightDetail(right));
  }

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
    this.basketService.removeRight(rightId);
    this.movieDistributionRights = this.movieDistributionRights.filter(
      right => right.id !== rightId
    );
  }

  public setPriceCurrency() {
    this.basketService.addBid({
      amount: this.priceControl.value,
      currency: 'euro'
    });
  }
}
