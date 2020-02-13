import { CurrencySlug } from '@blockframes/material/delivery/types';

export const enum MaterialStatus {
  pending = 'pending',
  available = 'available',
  delivered = 'delivered'
}

/** Generic interface of a material */
export interface MaterialRaw {
  id: string;
  value: string;
  description: string;
  category: string;
}

/** Document model of a material specific to a template. */
export interface MaterialTemplateDocument extends MaterialRaw {
  price: number; // TODO: Create "Price" type with currencies from static-models => ISSUE#818
  currency: CurrencySlug;
}


/** Document model of a material */
export interface MaterialDocument extends MaterialRaw {
  owner?: string;
  stepId?: string;
  status?: MaterialStatus;
  deliveryIds: string[];
  price?: number; // TODO: Create "Price" type with currencies from static-models => ISSUE#818
  currency?: CurrencySlug;
  isOrdered?: boolean;
  isPaid?: boolean;
  storage?: string;
}
