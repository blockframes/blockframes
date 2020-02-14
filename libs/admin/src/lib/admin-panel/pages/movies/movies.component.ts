import { Component, OnInit } from '@angular/core';
import { MovieService } from '@blockframes/movie';
import { getValue } from '@blockframes/utils/helpers';
import { DistributionDealService } from '@blockframes/movie/distribution-deals';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

@Component({
  selector: 'admin-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
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
    'distributionDealsInfo': 'Distribution deals',
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
    'distributionDealsInfo',
    'contractsInfo',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private movieService: MovieService,
    private distributionDealService: DistributionDealService,
    private contractService: ContractService,
  ) { }

  async ngOnInit() {
    const movies = await this.movieService.getAllMovies();

    const promises = movies.map(async m => {
      const row = {...m} as any;

      // We add distribution deals infos to the row
      const distributionDeals = await this.distributionDealService.getMovieDistributionDeals(m.id);
      row.distributionDealsInfo =  { 
        link: `/c/o/admin/panel/deals/${m.id}`,
        count: distributionDeals.length
      };

      // We add contracts infos to the row
      const contract = await this.contractService.getMovieContracts(m.id);
      row.contractsInfo =  { 
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
  }


  filterPredicate(data: any, filter) {
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

  public getPath(movieId: string, segment: string = 'main') {
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

}
