import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { MovieCurrency } from '@blockframes/utils/static-model';

export interface Bucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract[];
}

interface BucketContract {
  titleId: string;
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: AvailsFilter[];
}

function createBucketTerm(params: Partial<AvailsFilter> = {}): AvailsFilter {
  return {
    territories: [],
    medias: [],
    exclusive: false,
    duration: { from: new Date(), to: new Date() },
    ...params
  }
}

function createBucketContract(params: Partial<BucketContract> = {}): BucketContract {
  return {
    titleId: '',
    orgId: '',
    price: 0,
    parentTermId: '',
    terms: params.terms?.map(createBucketTerm) ?? []
  }
}

export function createBucket(params: Partial<Bucket> = {}): Bucket {
  return {
    id: '',
    currency: 'EUR',
    ...params,
    contracts: params.contracts?.map(createBucketContract) ?? []
  }
}