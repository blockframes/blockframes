import { Component, OnInit } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { DistributionDealService, DistributionDealWithMovieId, createDistributionDealWithMovieId, formatDistributionDeal } from '@blockframes/movie/distribution-deals';
import { termToPrettyDate } from '@blockframes/utils/common-interfaces/terms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-distribution-deals',
  templateUrl: './distribution-deals.component.html',
  styleUrls: ['./distribution-deals.component.scss']
})
export class DistributionDealsComponent implements OnInit {
  public versionColumns = {
    'deal.id': 'Id',
    'deal.publicId': 'Public id',
    'movieId': 'Movie',
    'deal.status': 'Status',
    'deal.contractId': 'Contract',
    'deal.terms': 'Scope',
    'deal.exclusive': 'Exclusive',
  };

  public initialColumns: string[] = [
    'deal.id',
    'deal.publicId',
    'movieId',
    'deal.status',
    'deal.contractId',
    'deal.terms',
    'deal.exclusive'
  ];
  public rows: DistributionDealWithMovieId[] = [];
  public toPrettyDate = termToPrettyDate;
  public movieId = '';
  constructor(
    private distributionDealService: DistributionDealService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {

    this.movieId = this.route.snapshot.paramMap.get('movieId');

    if (this.movieId) {
      this.rows = (await this.distributionDealService.getMovieDistributionDeals(this.movieId))
      .map(deal => createDistributionDealWithMovieId({ 
        deal: formatDistributionDeal(deal), 
        movieId: this.movieId,
       }))
    } else {
      this.rows = await this.distributionDealService.getAllDistributionDealsWithMovieId();
    }

  }

  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'deal.id',
      'deal.publicId',
      'movieId',
      'deal.status',
      'deal.contractId',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public getPath(movieId: string) {
    return `/c/o/dashboard/tunnel/movie/${movieId}/deals`;
  }

}
