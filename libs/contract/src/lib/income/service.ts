import { Injectable } from '@angular/core';
import { MovieCurrency } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

export interface Income { // TODO #8280 move to model lib
  /** Should be the same as the sale that generated this income */
  id: string;
  /** TermId of the mandate contract on which it applies first */
  termId: string;
  /** The contract (sale in this case) that created this income */
  contractId: string;
  price: number;
  currency: MovieCurrency;
  offerId?: string;
}

@Injectable({ providedIn: 'root' })
export class IncomeService extends BlockframesCollection<Income> {
  readonly path = 'incomes';
}
