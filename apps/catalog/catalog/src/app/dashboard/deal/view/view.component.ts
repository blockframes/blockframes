import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, Contract, ContractService, ContractPartyDetail } from '@blockframes/contract/+state';
import { Observable } from 'rxjs/internal/Observable';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { map } from 'rxjs/operators';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';

@Component({
  selector: 'catalog-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealViewComponent implements OnInit {

  public contract$: Observable<Contract>;
  public licensees: ContractPartyDetail[];
  public lastVersion: ContractVersion;

  constructor(private query: ContractQuery, private service: ContractService, private contractVersionService: ContractVersionService) { }

  ngOnInit() {
    this.contract$ = this.query.selectActive().pipe(
      map(contract => {
        this.licensees = this.service.getContractParties(contract, 'licensee');
        this.lastVersion = contract.versions.reduce((a, b) => (a.creationDate > b.creationDate ? a : b));
        return contract;
      })
    );
  }

}
