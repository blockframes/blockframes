import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'contract-lobby',
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
    const contractId = await this.service.add({});
    this.router.navigate([type, contractId], { relativeTo: this.route })
  }
}
