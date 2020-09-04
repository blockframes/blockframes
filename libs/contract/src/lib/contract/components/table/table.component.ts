import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Contract, getTotalPrice } from '../../+state';
import { ContractStatus } from '@blockframes/utils/static-model/types';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DistributionRightQuery } from '@blockframes/distribution-rights/+state';
import { Router, ActivatedRoute } from '@angular/router';
import { Price } from '@blockframes/utils/common-interfaces';

interface ContractView {
  id: string;
  buyerName: string;
  territories: string[];
  creationDate: Date;
  moviesLength: number;
  titles: string[];
  price: Price;
  paid: 'Yes' | 'No',
  status: ContractStatus
}

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

const baseColumns: ColumnsKeys[] = [
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
  selector: '[contracts] [app] contract-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTableComponent {

  columns: Partial<typeof columns> = getColumns(baseColumns);
  initialColumns = baseColumns;
  sources: ContractView[];

  /** Specify in which app the contract table is used */
  @Input() app: 'marketplace' | 'dashboard';

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
    private rightQuery: DistributionRightQuery,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  private createContractListView(contract: Contract): ContractView {
    return {
      id: contract.id,
      buyerName: contract.parties.find(({ party }) => party.role === 'licensee').party.displayName,
      territories: this.rightQuery.getTerritoriesFromContract(contract.lastVersion),
      creationDate: contract.lastVersion.creationDate,
      moviesLength: contract.titleIds.length,
      titles: this.movieQuery.getAll().filter(m => contract.titleIds.includes(m.id)).map(m => m.title.international),
      price: getTotalPrice(contract.lastVersion.titles),
      paid: contract.lastVersion.status === 'paid' ? 'Yes' : 'No',
      status: contract.lastVersion.status
    }
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToSale(contract: ContractView) {
    const basePath = `/c/o/${this.app}`;
    const path = (contract.status === 'draft')
      ? `${basePath}/tunnel/contract/${contract.id}/sale`
      : `${basePath}/deals/${contract.id}`;
    this.router.navigate([path], { relativeTo: this.route });
  }
}
