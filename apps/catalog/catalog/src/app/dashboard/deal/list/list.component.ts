import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ContractQuery,
  Contract,
  ContractStatus,
  getContractParties
} from '@blockframes/contract/contract/+state';
import { FormControl } from '@angular/forms';
import { startWith, share, map } from 'rxjs/operators';

interface ContractView {
  buyerName: string;
  territories: string;
  dateReceived: string;
  moviesLenght: number;
  titles: string;
  price: string;
  paid: boolean;
  remaining: string;
  status: ContractStatus;
}

function createContractView(contract: Contract): ContractView {
  return {
    buyerName: getContractParties(contract, 'licensee')[0].party.displayName,
    territories: 'View',
    dateReceived: 'Date receveid',
    moviesLenght: 0,
    titles: 'Titles',
    price: 'Price',
    paid: false,
    remaining: 'Remaining',
    status: contract.versions[0].status
  };
}

const columns = {
  buyerName: 'Buyer name',
  territories: 'Territories',
  dateReceived: 'Date receveid',
  moviesLenght: ' # Films',
  titles: 'Titles',
  price: 'Price',
  paid: 'Paid',
  remaining: 'Remaining',
  status: 'Status'
};

@Component({
  selector: 'catalog-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent implements OnInit {
  public columns = columns;
  public initialColumns = [
    'buyerName',
    'territories',
    'dateReceived',
    'moviesLenght',
    'titles',
    'price',
    'paid',
    'remaining',
    'status'
  ];

  contracts$: Observable<ContractView[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(
    startWith(this.filter.value),
    share()
  );

  constructor(private contractQuery: ContractQuery) {}

  ngOnInit() {
    // Get all organization's contract and return them with all their versions.
    this.contracts$ = this.contractQuery
      .selectAll()
      .pipe(map(contracts => contracts.map(contract => createContractView(contract))));

      this.contracts$.subscribe(x => console.log(x))
  }
}
