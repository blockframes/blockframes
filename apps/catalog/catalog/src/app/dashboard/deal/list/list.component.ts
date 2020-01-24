import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ContractQuery, Contract } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'catalog-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent implements OnInit {
  public contracts$: Observable<Contract[]>;

  constructor(private contractQuery: ContractQuery) {}

  ngOnInit() {
    // Get all organization's contract and return them with all their versions.
    this.contracts$ = this.contractQuery.selectAll();
  }
}
