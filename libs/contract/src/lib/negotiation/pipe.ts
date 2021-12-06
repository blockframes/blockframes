import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { OrganizationQuery, OrganizationService } from "@blockframes/organization/+state";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { Negotiation } from "./+state/negotiation.firestore";

@Pipe({ name: 'negotiationStage' })
export class NegotiationStagePipe implements PipeTransform {
  activeOrgId = this.orgQuery.getActiveId();

  constructor(
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
  ) { }

  //here orgName is the seller that we need to get from stakeholders that are neither buyerId nor sellerId)
  getOrgName(negotiation: Negotiation) {
    const excluded = [negotiation.buyerId, negotiation.sellerId]
    const seller = negotiation.stakeholders.find(s => !excluded.includes(s))
    return seller;
  }

  transform(negotiation: Negotiation, ...args: any[]): any {
    if (!(negotiation?.status === 'pending')) return ''
    if (negotiation?.createdByOrg !== this.activeOrgId) return of('To be Reviewed');
    const seller = this.getOrgName(negotiation)
    if (!seller) return of('');
    return this.orgService.valueChanges(seller).pipe(
      map(org => `Waiting for ${org.denomination.public} answer`)
    )
  }
}


@NgModule({
  declarations: [
    NegotiationStagePipe,
  ],
  exports: [
    NegotiationStagePipe,
  ]
})
export class NegotiationPipeModule { }
