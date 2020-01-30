import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { startWith } from 'rxjs/operators';
import { Contract, getTotalPrice } from '../+state/contract.model';
import { MatPaginator } from '@angular/material/paginator';
import { getLastVersionIndex } from '../+state';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Price } from '@blockframes/utils/common-interfaces/price';
import { MovieQuery, getMovieTitleList } from '@blockframes/movie';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state/distribution-deal.service';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';

@Component({
  selector: 'contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent implements OnInit {
  @Input()
  set source(contracts: Contract[]) {
    this.dataSource = new MatTableDataSource(contracts);
    this.dataSource.sort = this.sort;
  }

  public columns = {
    buyerName: 'Buyer name',
    territories: 'Territories',
    dateReceived: 'Date received',
    moviesLenght: ' # Films',
    titles: 'Titles',
    price: 'Price',
    paid: 'Paid',
    status: 'Status'
  };

  public initialColumns = [
    'buyerName',
    'territories',
    'dateReceived',
    'moviesLenght',
    'titles',
    'price',
    'paid',
    'status'
  ];

  public displayedColumns$: Observable<string[]>;
  public dataSource: MatTableDataSource<Contract>;
  public columnFilter = new FormControl([]);

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private movieQuery: MovieQuery, private dealService: DistributionDealService) {}

  ngOnInit() {
    this.columnFilter.patchValue(this.initialColumns);
    this.displayedColumns$ = this.columnFilter.valueChanges.pipe(startWith(this.initialColumns));
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Returns the last version of a given contract. */
  public getLastVersion(contract: Contract): ContractVersion {
    return contract.versions[getLastVersionIndex(contract)];
  }

  /** Returns the conctract licensee name. */
  public getBuyerName(contract: Contract): string {
    const buyer = contract.parties.find(({party}) => party.role === 'licensee').party;
    return buyer.displayName;
  }

  /** Returns the total price of the contract. */
  public getContractTotalPrice(contract: Contract): Price {
    return getTotalPrice(this.getLastVersion(contract).titles);
  }

  /** Returns all the eligible territories of the contract. */
  public getContractTerritories(contract: Contract): string[] {
    const lastVersion = this.getLastVersion(contract);
    return this.dealService.getTerritoriesFromContract(lastVersion);
  }

  /** Returns a list of movie's names of the contract. */
  public getMovieNames(contract: Contract): string[] {
    const movies = this.movieQuery.getAll({ filterBy: movie => contract.titleIds.includes(movie.id) });
    return getMovieTitleList(movies);
  }
}
