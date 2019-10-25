import { BasketService } from './../../distribution-right/+state/basket.service';
import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MarketplaceMovieViewComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-view';
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;

  constructor(
    private query: MovieQuery,
    private basketService: BasketService,
    private orgQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.getMovie();
    console.log(this.orgQuery.getValue());
  }

  private getMovie() {
    this.loading$ = this.query.selectLoading();
    this.movie$ = this.query.selectActive();
  }

  public addToWishlist() {
    this.basketService.updateWishlist(this.query.getActive());
  }

  get internationalPremiere() {
    const name = this.query.getActive().main.title.original;
    const year = this.query.getActive().main.productionYear;
    return name !== '' ? `${name}, ${year}` : null;
  }

  get color() {
    const color = this.query.getActive().salesInfo.color;
    return color === 'c' ? 'color' : 'black & white';
  }

  get europeanQualification() {
    const europeanQualification = this.query.getActive().salesInfo.europeanQualification;
    return europeanQualification ? 'Yes' : 'No';
  }
}
