export interface Contract {
  id: string;
  type: 'mandate' | 'sale';
  status: 'pending' | 'accepted' | 'declined' | 'archived';
  titleId: string;
  /** Parent term on which this contract is created */
  parentTermId: string;
  /** List of discontinued terms */
  termIds: string[];
  /** Offer in which the contract is included is any */
  offerId?: string;
  /** The id of the buyer, can be undefined if external sale */
  buyerId?: string;
  /** Id of the direct seller. AC in the Archipel Content app */
  sellerId: string;
  /** Org ids that have contract parent of this contract */
  stakeholders: string[];
}
export interface Mandate extends Contract {
  type: 'mandate';
}
export interface Sale extends Contract {
  type: 'sale';
  /** Free text provided by the buyer, addressed to the seller */
  specificTerms: string;
  /** Create the anccestors organization when you create the sale */
  ancestors: string[]; // ??? The orgs that have a parent contract with the
  // incomeId: string; // Id of the terms/right on which income should occured
}


export function createMandate(params: Partial<Mandate> = {}): Mandate {
  return {
    id: '',
    titleId: '',
    termIds: [],
    parentTermId: '',
    buyerId: '', // For external sales this is undefined
    sellerId: '', // Archipel content or the Seller
    type: 'mandate',
    status: 'pending',
    stakeholders: [],
    ...params
  }
}

export function createSale(params: Partial<Sale> = {}): Sale {
  return {
    id: '',
    titleId: '',
    termIds: [],
    specificTerms: '',
    parentTermId: '',
    ancestors: [],
    buyerId: null, // For external sales this is undefined
    sellerId: '', // Archipel content or the Seller
    type: 'sale',
    status: 'pending',
    stakeholders: [],
    ...params
  }
}
