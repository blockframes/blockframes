import { Territory } from '@blockframes/shared/model';
export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country?: Territory;
  region?: string;
  phoneNumber: string;
}

export interface DocsIndex {
  /** @dev doc author'id. Setted by a backend function */
  authorOrgId: string;
}
/** A factory function that creates an Address/Location */
export function createLocation(params: Partial<Location> = {}): Location {
  return {
    street: '',
    zipCode: '',
    city: '',
    phoneNumber: '',
    region: '',
    ...params
  };
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface FormSaveOptions {
  publishing: boolean;
}