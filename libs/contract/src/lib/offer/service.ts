import { Injectable } from '@angular/core';
import { Offer } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class OfferService extends BlockframesCollection<Offer> {
  readonly path = 'offers';
}
