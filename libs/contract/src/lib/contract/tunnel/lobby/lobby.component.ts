import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '../../+state';
import { ContractType } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

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
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Choose a contract type', 'Create an offer')
  }

  async select(type: ContractType) {
    const contractId = await this.service.create({ type });
    this.router.navigate([contractId, type], { relativeTo: this.route })
  }
}
