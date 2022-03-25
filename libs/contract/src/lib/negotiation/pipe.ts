import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Negotiation } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractStatus } from '@blockframes/utils/static-model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getReviewer, isInitial } from './utils';

function canNegotiate(negotiation: Negotiation, activeOrgId: string) {
  return negotiation.status === 'pending' && negotiation.createdByOrg !== activeOrgId;
}

@Pipe({ name: 'negotiationStage' })
export class NegotiationStagePipe implements PipeTransform {
  activeOrgId = this.orgService.org.id;

  constructor(
    private orgService: OrganizationService,
  ) { }

  transform(negotiation: Negotiation): Observable<string> {
    if (negotiation?.status !== 'pending') return of('');
    if (negotiation?.createdByOrg !== this.activeOrgId) return of('To be Reviewed');
    const reviewer = getReviewer(negotiation);
    return this.orgService.valueChanges(reviewer).pipe(
      map(org => `Waiting for ${org.denomination.public} answer`)
    );
  }
}

@Pipe({ name: 'isInitialNegotiation ' })
export class IsInitialNegotiationPipe implements PipeTransform {
  transform(negotiation: Negotiation): boolean {
    return isInitial(negotiation);
  }
}

@Pipe({ name: 'canNegotiate' })
export class CanNegotiatePipe implements PipeTransform {
  transform(negotiation: Negotiation, activeOrgId: string): boolean {
    return canNegotiate(negotiation, activeOrgId);
  }
}

@Pipe({ name: 'negotiationStatus' })
export class NegotiationStatusPipe implements PipeTransform {
  transform(negotiation: Negotiation): ContractStatus {
    const pending = negotiation?.status === 'pending'
    if (isInitial(negotiation) && pending) return 'pending';
    if (negotiation?.status === 'pending') return 'negotiating';
    return negotiation?.status;
  }
}

@Pipe({ name: 'canAccept' })
export class CanAcceptNegotiationPipe implements PipeTransform {
  constructor(private orgService: OrganizationService) { }
  transform(negotiation: Negotiation) {
    return negotiation.status === 'pending'
      && negotiation.price
      && negotiation.createdByOrg !== this.orgService.org.id;
  }
}

@NgModule({
  declarations: [
    NegotiationStagePipe,
    CanAcceptNegotiationPipe,
    IsInitialNegotiationPipe,
    NegotiationStatusPipe,
    CanNegotiatePipe,
  ],
  exports: [
    NegotiationStagePipe,
    CanAcceptNegotiationPipe,
    IsInitialNegotiationPipe,
    NegotiationStatusPipe,
    CanNegotiatePipe,
  ]
})
export class NegotiationPipeModule { }
