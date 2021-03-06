import { MovieCurrency } from "@blockframes/utils/static-model";

export interface Income {
  /** Should be the same as the sale that generated this income */
  id: string;
  /** TermsId of the mandate contract on which it applies first */
  termId: string;
  /** The contract (sale in this case) that created this income */
  contractId: string;
  price: number;
  currency: MovieCurrency;
  offerId?: string;
}
