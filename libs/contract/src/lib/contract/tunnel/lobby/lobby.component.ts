import { createContractVersion, createContract, createVersionMandate } from '@blockframes/contract/contract/+state/contract.model';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractType } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'contract-tunnel-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent {

  constructor(
    private service: ContractService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async select(contractType: 'sale' | 'mandate') {
    const type = contractType === 'sale' ? ContractType.sale : ContractType.mandate;
    const contract = createContract({ type });
    const version = contractType === 'mandate'
      ? createVersionMandate()
      : createContractVersion();
    const contractId = await this.service.create(contract, version);
    this.router.navigate([contractId, contractType], { relativeTo: this.route })
  }
}
