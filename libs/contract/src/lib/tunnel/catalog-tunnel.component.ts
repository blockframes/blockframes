import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state/distribution-deal.service';
import { Component } from '@angular/core';
@Component({
  selector: 'catalog-tunnel-tunnel',
  templateUrl: './catalog-tunnel.component.html',
  styleUrls: ['./catalog-tunnel.component.scss'],
  providers:[]
})
export class CatalogTunnelComponent {
  constructor(private dealsService: DistributionDealService, private contractDeals: ContractService) {

  }
}
