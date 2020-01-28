export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country: string;
  region?: string;
  phoneNumber: string;
}

export interface BankAccount {
  address: Location;
  IBAN: string;
  BIC: string;
  name: string;
}

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
    ...params
  };
}