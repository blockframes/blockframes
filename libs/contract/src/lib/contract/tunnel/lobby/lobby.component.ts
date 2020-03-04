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

  async select(type: 'sale' | 'mandate') {
    const contractId = await this.service.create({ type });
    this.router.navigate([contractId, type], { relativeTo: this.route })
  }
}
