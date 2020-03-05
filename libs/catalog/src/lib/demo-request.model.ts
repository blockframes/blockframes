/** Custom object used to build a demo request email. */
export interface RequestDemoInformations {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName: string;
  role: RequestDemoRole;
}

export const requestDemoRole = {
  buyer: 'Buyer',
  seller: 'Seller',
  other: 'Other'
} as const;

export type RequestDemoRole = keyof typeof requestDemoRole;
export type RequestDemoRoleValue = typeof requestDemoRole[RequestDemoRole];

/** A factory function to create a demo request. */
export function createDemoRequestInformations(
  informations: RequestDemoInformations
): RequestDemoInformations {
  return {
    ...informations,
    phoneNumber: informations.phoneNumber || ''
  };
}
