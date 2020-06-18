import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue } from '@blockframes/utils/helpers';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

@Component({
  selector: 'admin-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'main.internalRef': 'Internal Ref',
    'promotionalElements.poster': 'Poster',
    'main.title.original': 'Original title',
    'main.productionYear': 'Production year',
    'main.storeConfig.status': 'Status',
    'main.storeConfig.storeType': 'Store type',
    'distributionRightsInfo': 'Distribution rights',
    'contractsInfo': 'Contracts',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'promotionalElements.poster',
    'main.internalRef',
    'main.title.original',
    'main.productionYear',
    'main.storeConfig.status',
    'main.storeConfig.storeType',
    'distributionRightsInfo',
    'contractsInfo',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private movieService: MovieService,
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const movies = await this.movieService.getAllMovies();

    const promises = movies.map(async m => {
      const row = { ...m } as any;

      // Append new data for table display

      // We add distribution rights infos to the row
      const distributionRights = await this.distributionRightService.getMovieDistributionRights(m.id);
      row.distributionRightsInfo = {
        link: `/c/o/admin/panel/rights/${m.id}`,
        count: distributionRights.length
      };

      // We add contracts infos to the row
      const contract = await this.contractService.getMovieContracts(m.id);
      row.contractsInfo = {
        link: `/c/o/admin/panel/contracts/${m.id}`,
        count: contract.length
      };

      // Edit link
      row.edit = {
        id: m.id,
        link: `/c/o/admin/panel/movie/${m.id}`,
      }

      return row;
    })

    this.rows = await Promise.all(promises);

    this.cdRef.markForCheck();
  }


  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'main.internalRef',
      'main.title.original',
      'main.productionYear',
      'main.storeConfig.status',
      'main.storeConfig.storeType',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
