import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { OrganizationQuery, OrganizationService } from "@blockframes/organization/+state";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { Negotiation } from "./+state/negotiation.firestore";

@Pipe({ name: 'negotiationStage' })
export class NegotiationStagePipe implements PipeTransform {
  activeOrgId = this.orgQuery.getActiveId();

  constructor(
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
  ) { }

  transform(negotiation: Negotiation): Observable<string> {
    if (!(negotiation?.status === 'pending')) return of('')
    if (negotiation?.createdByOrg !== this.activeOrgId) return of('To be Reviewed');
    return this.orgService.valueChanges(negotiation.createdByOrg).pipe(
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
