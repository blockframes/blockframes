import { Injectable } from '@angular/core';
import { Negotiation } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class NegotiationService extends BlockframesSubCollection<Negotiation> {
  readonly path = 'contracts/:contractId/negotiations';
}