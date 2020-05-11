import { TerritoriesSlug } from "@blockframes/utils/static-model";

export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country: TerritoriesSlug;
  region?: string;
  phoneNumber: string;
}

export interface BankAccount {
  address: Location;
  IBAN: string;
  BIC: string;
  name: string;
  holderName: string;
}

export interface DocsIndex {
  /** @dev doc author'id. Setted by a backend function */
  authorOrgId: string;
  /** @dev private custom config for a doc. Setted by an https callable function */
  config?: PrivateConfig
}

export interface PrivateConfig {
  url?: string
};

/** A factory function that creates an Address/Location */
export function createLocation(params: Partial<Location> = {}): Location {
  return {
    street: '',
    zipCode: '',
    city: '',
    country: '',
    phoneNumber: '',
    region: '',
    ...params
  };
}

/** A factory function that creates a BankAccount */
export function createBankAccount(params: Partial<BankAccount> = {}): BankAccount {
  return {
    address: createLocation(params && params.address),
    IBAN: '',
    BIC: '',
    name: '',
    holderName: '',
    ...params
  };
}