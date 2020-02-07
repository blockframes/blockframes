import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { getMovieReceipt } from '@blockframes/movie/movie/+state/movie.model';
import { Observable, Subscription } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';

const eventList = ['movieViews', 'addedToWishlist', 'promoReelOpened'];

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public eventList = eventList;
  public contracts: Contract[]
  public sales: number;
  public receipts: number;
  
  constructor(
    private movieService: MovieService, 
    private movieQuery: MovieQuery,
    private contractQuery: ContractQuery
  ) {}
  
  ngOnInit() {
    const movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.movieService.getMovieAnalytics([movieId]);
    let ownContracts = []
    this.contractQuery.selectAll().pipe(
      map(movies => movies.map(movie => {
        ownContracts = this.contracts.filter(c => getContractLastVersion(c).titles[movie.id]);
      }))
      )
     this.receipts = getMovieReceipt(ownContracts, movieId);
     this.sales = ownContracts.length;
  }
}
