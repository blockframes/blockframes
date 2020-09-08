import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue, downloadCsvFromJson, BehaviorStore } from '@blockframes/utils/helpers';
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
    'poster': 'Poster',
    'title': 'Original title',
    'org': 'Organization',
    'status': 'Status',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'poster',
    'title',
    'org',
    'status',
    'edit',
  ];
  public rows: any[] = [];
  public orgs: Record<string, Organization> = {};
  public exporting = new BehaviorStore(false);

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
      const row = {} as any;

      row.id = m.id
      row.internalRef = m.internalRef,
      row.poster = m.poster
      row.title = m.title.original
      row.status = m.storeConfig.status

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
      'internalRef',
      'title',
      'status',
      'org.denomination.full',
      'org.denomination.public'
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public async exportTable() {
    try {
      this.exporting.value = true;

      const movies = await this.movieService.getAllMovies();
      const promises = movies.map(async m => {
        const row = { ...m } as any;

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

        return row;
      })
      const data = await Promise.all(promises);
      const exportedRows = data.map(m => ({
        'movie id': m.id,
        'title': m.title.international,
        'internal ref': m.internalRef ? m.internalRef : '--',
        'org': m.org ? orgName(m.org) : '--',
        'orgId': m.org ? m.org.id : '--',
        'status': m.storeConfig.status,
        'storeType': m.storeConfig.storeType,
        'distributionRightsInfo': m.distributionRightsInfo.count,
        'contractsInfo': m.contractsInfo.count,
      }));

      downloadCsvFromJson(exportedRows, 'movies-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }

  }

  private async getOrg(id: string): Promise<Organization> {
    if (!this.orgs[id]) {
      const orgs = await this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', id));
      this.orgs[id] = orgs.pop();
    }

    return this.orgs[id];
  }
}
