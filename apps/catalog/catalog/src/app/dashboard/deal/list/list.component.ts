import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ContractQuery, ContractService, ContractWithLastVersion } from '@blockframes/contract/contract/+state';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent implements OnInit {
  public contracts$: Observable<ContractWithLastVersion[]>;

  constructor(private contractQuery: ContractQuery, private contractService: ContractService) {}

  ngOnInit() {
    // Get all organization's contract and return them with the last version in each one.
    this.contracts$ = this.contractQuery
      .selectAll()
      .pipe(
        switchMap(
          async contracts => await this.contractService.getContractListWithLastVersion(contracts)
        )
      );
  }
}
