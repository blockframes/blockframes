import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContractService, contractByMovieAndOrg } from '@blockframes/contract/contract/+state';
import { MovieQuery } from '@blockframes/movie';
import { switchMap } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { Query, awaitSyncQuery } from 'akita-ng-fire';

const navLinks = [{
  path: 'sales',
  label: 'Sales'
}, {
  path: 'details',
  label: 'Film Details'
},{
  path: 'avails',
  label: 'Avails'
}];

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class TitleViewComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  navLinks = navLinks;
  constructor(
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private contractService: ContractService,
    private dealService: DistributionDealService,
  ) { }

  ngOnInit() {
    //  Sync all contracts & deals from this movie && organization
    this.sub = combineLatest([
      this.movieQuery.selectActiveId(),
      this.orgQuery.selectActiveId()
    ]).pipe(
      switchMap(([movieId, orgId]) => {
        return combineLatest([
          awaitSyncQuery.call(this.contractService, contractByMovieAndOrg(movieId, orgId)),
          this.dealService.syncCollection({ params: { movieId }})
        ])
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
