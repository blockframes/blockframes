import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractType } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state';

@Component({
  selector: 'contract-tunnel-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent {

  constructor(
    private db: AngularFirestore,
    private service: ContractService,
    private versionService: ContractVersionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async select(contractType: 'sale' | 'mandate') {
    const type = contractType === 'sale' ? ContractType.sale : ContractType.mandate;
    const contractId = await this.service.create({ type });
    this.router.navigate([contractId, contractType], { relativeTo: this.route })
  }
}
