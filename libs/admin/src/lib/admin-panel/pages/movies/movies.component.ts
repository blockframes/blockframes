import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue, downloadCsvFromJson, BehaviorStore } from '@blockframes/utils/helpers';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { OrganizationService, orgName } from '@blockframes/organization/+state';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesComponent implements OnInit {
  public versionColumns = {
    'id': { value: 'Id', disableSort: true },
    'poster': { value: 'Poster', disableSort: true },
    'title.original': 'Original title',
    'org': 'Organization',
    'storeConfig.status': 'Status'
  };

  public initialColumns: string[] = [
    'id',
    'poster',
    'title.original',
    'org',
    'storeConfig.status'
  ];
  public rows: any[] = [];
  public exporting = new BehaviorStore(false);

  constructor(
    private movieService: MovieService,
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    const movies = await this.movieService.getAllMovies();
    // movie.orgIds is an array but in the front-end we only display one
    const orgIds = movies.map(movie => movie.orgIds[0]);
    const orgs = await this.orgService.getValue(orgIds);

    this.rows = movies.map(movie => {
      const org = orgs.find(o => o.id === movie.orgIds[0]);
      return { org, ...movie };
    })
    this.cdRef.markForCheck();
  }

  goToEdit(movie) {
    this.router.navigate([`/c/o/admin/panel/movie/${movie.id}`])
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'internalRef',
      'title.original',
      'storeConfig.status',
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
}
