import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { getMovieReceipt } from '@blockframes/movie/movie/+state/movie.model';
import { Observable } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public contracts$: Observable<Contract[]>;
  public getMovieReceipt = getMovieReceipt
  public movieId: string;
  
  constructor(
    private movieService: MovieService, 
    private movieQuery: MovieQuery,
    private contractQuery: ContractQuery,
    private orgQuery: OrganizationQuery
  ) {}
  
  ngOnInit() {
    this.movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.movieService.getMovieAnalytics([this.movieId]);
    this.contracts$ = this.contractQuery.selectAll().pipe(
      map(contracts => contracts.filter(contract => contract.partyIds.includes(this.orgQuery.getActiveId()) ? 
      getContractLastVersion(contract).titles[this.movieId] : null ))
    )
  }
}
