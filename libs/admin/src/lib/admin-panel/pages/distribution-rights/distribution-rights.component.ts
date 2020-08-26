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
    'right.publicId': 'Public id',
    'movieId': 'Movie',
    'right.status': 'Status',
    'right.contractId': 'Contract',
    'right.terms': 'Scope',
    'right.exclusive': 'Exclusive',
  };

  public initialColumns: string[] = [
    'rightLink',
    'right.publicId',
    'movieId',
    'right.status',
    'right.contractId',
    'right.terms',
    'right.exclusive'
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

        // Append new data for table display
        const row = { ...d } as any;
        row.rightLink = {
          id: d.right.id,
          movieId: d.movieId,
        }
        return row;
      })
    } else {
      const rights = await this.distributionRightService.getAllDistributionRightsWithMovieId();
      this.rows = rights.map(d => {
        const row = { ...d } as any;
        // Append new data for table display
        row.rightLink = {
          id: d.right.id,
          movieId: d.movieId,
        }
        return row;
      });
    }

    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'right.id',
      'right.publicId',
      'movieId',
      'right.status',
      'right.contractId',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
