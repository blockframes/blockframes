import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { ActivatedRoute } from '@angular/router';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { DistributionRightWithMovieId, createDistributionRightWithMovieId } from '@blockframes/distribution-rights/+state/distribution-right.model';

@Component({
  selector: 'admin-distribution-rights',
  templateUrl: './distribution-rights.component.html',
  styleUrls: ['./distribution-rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightsComponent implements OnInit {
  public versionColumns = {
    'rightLink': 'Id',
    'rightPublicId': 'Public id',
    'movieId': 'Movie',
    'rightStatus': 'Status',
    'rightContractId': 'Contract',
    'rightTerms': 'Scope',
    'rightExclusive': 'Exclusive',
  };

  public initialColumns: string[] = [
    'rightLink',
    'rightPublicId',
    'movieId',
    'rightStatus',
    'rightContractId',
    'rightTerms',
    'rightExclusive'
  ];
  public rows: any[] = [];
  public movieId = '';
  constructor(
    private distributionRightService: DistributionRightService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    this.movieId = this.route.snapshot.paramMap.get('movieId');

    if (this.movieId) {
      const rights = await this.distributionRightService.getMovieDistributionRights(this.movieId);
      this.rows = rights.map(right => {
        const d: DistributionRightWithMovieId = createDistributionRightWithMovieId({
          right,
          movieId: this.movieId,
        });

        return this.formatRow(d);
      });
    } else {
      const rights = await this.distributionRightService.getAllDistributionRightsWithMovieId();
      this.rows = rights.map(d => this.formatRow(d));
    }

    this.cdRef.markForCheck();
  }

  public formatRow(d : DistributionRightWithMovieId) : any {
    return { 
      ...d,
      rightPublicId: d.right.publicId,
      rightStatus: d.right.status,
      rightContractId: d.right.contractId,
      rightTerms: d.right.terms,
      rightExclusive: d.right.exclusive,
      rightLink: {
        id: d.right.id,
        movieId: d.movieId,
      }
    };
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'rightId',
      'rightPublicId',
      'movieId',
      'rightStatus',
      'rightContractId',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
