import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractType } from '../../+state';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

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
    private title: Title
  ) { 
    this.title.setTitle('Choose a contract type - Create an offer - Archipel Content')
  }

  async select(type: ContractType) {
    const contractId = await this.service.create({ type });
    this.router.navigate([contractId, type], { relativeTo: this.route })
  }
}
