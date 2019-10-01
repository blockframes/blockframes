import { Step, Delivery } from '../../delivery/+state';
import { staticModels } from '@blockframes/movie';
type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];
// TODO: Create "Price" type with currencies from static-models => ISSUE#818

export interface MaterialRaw {
  id: string;
  value: string;
  description: string;
  category: string;
}

/** Extends a Material Raw with fields that are specific to Material Template. */
export interface MaterialTemplate extends MaterialRaw {
  price: number;
  currency: CurrencyCode;
}

export interface Material extends MaterialRaw {
  owner?: string;
  stepId?: string;
  step?: Step;
  status?: MaterialStatus;
  deliveryIds?: string[];
  price?: number; // TODO: Create "Price" type with currencies from static-models => ISSUE#818
  currency?: CurrencyCode;
  isOrdered?: boolean;
  isPaid?: boolean;
  storage?: string;
}

export const enum MaterialStatus {
  pending = 'Pending',
  available = 'Available',
  delivered = 'Delivered'
}

export const materialStatuses: MaterialStatus[] = [
  MaterialStatus.pending,
  MaterialStatus.available,
  MaterialStatus.delivered
];

export interface MaterialTemplateForm {
  value: string;
  description: string;
  category: string;
}

// TODO: Type safety => ISSUE#774
export function createMaterial(material: Partial<Material>): Material {
  return {
    id: material.id,
    category: '',
    value: '',
    description: '',
    status: material.status || MaterialStatus.pending,
    isOrdered: false,
    isPaid: false,
    ...material
  };
}

export function getMaterialStep(material: Material, delivery: Delivery) {
  // Add the step of a material by the step of delivery
  return {
    ...material,
    step: delivery.steps.find(deliveryStep =>
      material.stepId ? deliveryStep.id === material.stepId : null
    )
  };
}

/** A factory function that creates a Material Template */
export function createMaterialTemplate(material: Partial<MaterialTemplate>): MaterialTemplate {
  return {
    id: material.id,
    category: '',
    value: '',
    description: '',
    price: null,
    currency: null,
    ...material
  };
}

/** Convert a type Material to MaterialTemplate with only the corresponding fields */
export function convertMaterialToMaterialTemplate(material: Partial<Material>): MaterialTemplate {
  return {
    id: material.id,
    category: material.category,
    value: material.value,
    description: material.description,
    price: material.price,
    currency: material.currency
  };
}
