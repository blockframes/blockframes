import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { Pipe, PipeTransform } from '@angular/core';
import { Contract } from '@blockframes/contract/contract/+state';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { of } from 'rxjs';

@Component({
  selector: 'catalog-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {
  offer$ = this.shell.offer$;

  constructor(
    private shell: OfferShellComponent,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  goToContract({ id }: { id: string }) {
    this.router.navigate([id], { relativeTo: this.route });
  }

}


@Pipe({ name: 'negotiationStage' })

export class NegotiationStagePipe implements PipeTransform {
  activeOrgId = this.orgQuery.getActiveId();

  constructor(
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
  ) { }

  //here orgName is the seller that you need to get from stakeholders that are neither buyerId nor sellerId)
  getOrgName(contract: Contract) {
    const excluded = [contract.buyerId, contract.sellerId]
    const seller = contract.stakeholders.find(s => !excluded.includes(s))
    return seller;
  }

  transform(contract: any, ...args: any[]): any {
    if (['negotiating', 'pending'].includes(contract.status)) {
      if (contract?.negotiation?.createdByOrg !== this.activeOrgId) return of('To be Reviewed');
      else {
        const seller = this.getOrgName(contract)
        if (!seller) return of('No Organization found.');
        return this.orgService.getValue(seller).then(
          org => `Waiting for ${org.denomination.public} answer`
          )
      }
    }
    else return ''
  }
}
