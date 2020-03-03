import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { DistributionDealService, DistributionDealWithMovieId, createDistributionDealWithMovieId } from '@blockframes/movie/distribution-deals';
import { termToPrettyDate } from '@blockframes/utils/common-interfaces/terms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-distribution-deals',
  templateUrl: './distribution-deals.component.html',
  styleUrls: ['./distribution-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealsComponent implements OnInit {
  public versionColumns = {
    'dealLink': 'Id',
    'deal.publicId': 'Public id',
    'movieId': 'Movie',
    'deal.status': 'Status',
    'deal.contractId': 'Contract',
    'deal.terms': 'Scope',
    'deal.exclusive': 'Exclusive',
  };

  public initialColumns: string[] = [
    'dealLink',
    'deal.publicId',
    'movieId',
    'deal.status',
    'deal.contractId',
    'deal.terms',
    'deal.exclusive'
  ];
  public rows: any[] = [];
  public toPrettyDate = termToPrettyDate;
  public movieId = '';
  constructor(
    private distributionDealService: DistributionDealService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    this.movieId = this.route.snapshot.paramMap.get('movieId');

    if (this.movieId) {
      const deals = await this.distributionDealService.getMovieDistributionDeals(this.movieId);
      this.rows = deals.map(deal => {
        const d: DistributionDealWithMovieId = createDistributionDealWithMovieId({
          deal,
          movieId: this.movieId,
        });

        // Append new data for table display
        const row = { ...d } as any;
        row.dealLink = {
          id: d.deal.id,
          movieId: d.movieId,
        }
        return row;
      })
    } else {
      const deals = await this.distributionDealService.getAllDistributionDealsWithMovieId();
      this.rows = deals.map(d => {
        const row = { ...d } as any;
        // Append new data for table display
        row.dealLink = {
          id: d.deal.id,
          movieId: d.movieId,
        }
        return row;
      });
    }

    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
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

  public getMoviePath(movieId: string) {
    return `/c/o/dashboard/tunnel/movie/${movieId}`;
  }

  public getDealPath(dealId: string, movieId: string) {
    return `/c/o/admin/panel/deal/${dealId}/m/${movieId}`;
  }

}
