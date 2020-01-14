/** Custom object used to build a demo request email. */
export interface RequestDemoInformations {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName: string;
  role: RequestDemoRole;
}

export const enum RequestDemoRole {
  buyer = 'Buyer',
  seller = 'Seller',
  other = 'Other'
}

/** A factory function to create a demo request. */
export function createDemoRequestInformations(
  informations: RequestDemoInformations
): RequestDemoInformations {
  return {
    ...informations,
    phoneNumber: informations.phoneNumber || ''
  };
}
