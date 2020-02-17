import { ContractVersionDocumentWithDates } from './../../+state/contract.firestore';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractType } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';
import { CommissionBase } from '@blockframes/utils/common-interfaces';

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
    const version = {
      price: { commissionBase: CommissionBase.grossreceipts, amount: 0, currency: 'EUR' }
    } as ContractVersionDocumentWithDates;
    const contractId = await this.service.create({ type }, version);
    this.router.navigate([contractId, contractType], { relativeTo: this.route })
  }
}
