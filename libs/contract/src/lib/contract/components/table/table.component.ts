import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Contract, getTotalPrice, ContractStatus } from '../../+state';
import { getContractLastVersion } from '@blockframes/contract/version/+state';
import { MovieQuery } from '@blockframes/movie';
import { DistributionDealQuery } from '@blockframes/movie/distribution-deals/+state';

const columns = {
  buyerName: 'Buyer name',
  territories: 'Territories',
  creationDate: 'Date of creation',
  moviesLength: ' # Films',
  titles: 'Titles',
  price: 'Price',
  paid: 'Paid',
  status: 'Status'
} as const;

type ColumnsKeys = keyof typeof columns;

const baseColumns : ColumnsKeys[] = [
  'territories',
  'creationDate',
  'moviesLength',
  'titles',
  'price',
  'paid',
  'status'
];

function getColumns(keys: ColumnsKeys[]): Partial<typeof columns> {
  return keys.reduce((acc, key) => {
    acc[key] = columns[key];
    return acc
  }, {});
}

@Component({
  selector: 'contract-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTableComponent{

  columns: Partial<typeof columns> = getColumns(baseColumns);
  initialColumns = baseColumns;
  sources: any[];

  @Input() set hasBuyer(hasBuyer: string | boolean) {
    if (hasBuyer === '' || hasBuyer === true) {
      this.initialColumns = ['buyerName', ...baseColumns];
      this.columns = columns;
    }
  }

  @Input() set contracts(contracts: Contract[]) {
    this.sources = contracts.map(contract => this.createContractListView(contract));
  }
  
  constructor(
    private movieQuery: MovieQuery,
    private dealQuery: DistributionDealQuery,
    private cdr: ChangeDetectorRef
  ) { }

  private createContractListView(contract: Contract) {
    // @todo(#1887) Don't use getContractLastVersion function
    const version = getContractLastVersion(contract);
    return {
      buyerName: contract.parties.find(({party}) => party.role === 'licensee').party.displayName,
      territories: this.dealQuery.getTerritoriesFromContract(version),
      creationDate: version.creationDate,
      moviesLength: contract.titleIds.length,
      titles: this.movieQuery.getAll().filter(m => contract.titleIds.includes(m.id)).map(m => m.main.title.international),
      price: getTotalPrice(version.titles),
      paid: version.status === 'paid' ? 'Yes' : 'No',
      status: ContractStatus[version.status]
    }
  }
}
