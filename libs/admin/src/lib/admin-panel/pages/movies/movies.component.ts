import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { OrganizationService, orgName, Organization } from '@blockframes/organization/+state';

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
    'main.poster': 'Poster',
    'main.title.original': 'Original title',
    'org': 'Organization',
    'main.storeConfig.status': 'Status',
    'main.storeConfig.storeType': 'Store type',
    'distributionRightsInfo': 'Distribution rights',
    'contractsInfo': 'Contracts',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'main.poster',
    'main.internalRef',
    'main.title.original',
    'org',
    'main.storeConfig.status',
    'main.storeConfig.storeType',
    'distributionRightsInfo',
    'contractsInfo',
    'edit',
  ];
  public rows: any[] = [];
  public orgs: Record<string, Organization> = {};

  constructor(
    private movieService: MovieService,
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private orgService: OrganizationService,
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

      row.org = await this.getOrg(m.id);

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
      'main.storeConfig.status',
      'main.storeConfig.storeType',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public exportTable() {
    const exportedRows = this.rows.map(m => ({
      'movie id': m.id,
      'title': m.main.title.international,
      'internal ref': m.main.internalRef ? m.main.internalRef : '--',
      'org': m.org ? orgName(m.org) : '--',
      'orgId': m.org ? m.org.id : '--',
      'status': m.main.storeConfig.status,
      'storeType': m.main.storeConfig.storeType,
      'distributionRightsInfo': m.distributionRightsInfo.count,
      'contractsInfo': m.contractsInfo.count,
    }))
    downloadCsvFromJson(exportedRows, 'movies-list');
  }

  private async getOrg(id: string): Promise<Organization> {
    if (!this.orgs[id]) {
      const orgs = await this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', id));
      this.orgs[id] = orgs.pop();
    }

    return this.orgs[id];
  }
}
