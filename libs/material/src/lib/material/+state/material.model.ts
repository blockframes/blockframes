import { Delivery, CurrencyCode } from '../../delivery/+state';
import { MaterialStatus, MaterialDocument, MaterialRaw } from './material.firestore';

export { MaterialStatus } from './material.firestore';

/** Extends a Material Raw with fields that are specific to Material Template. */
export interface MaterialTemplate extends MaterialRaw {
  price: number; // TODO: Create "Price" type with currencies from static-models => ISSUE#818
  currency: CurrencyCode;
}

export type Material = MaterialDocument;

export const materialStatuses: MaterialStatus[] = [
  MaterialStatus.pending,
  MaterialStatus.available,
  MaterialStatus.delivered
];

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
    deliveryIds: [],
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
    category: material.category || '',
    value: material.value || '',
    description: material.description || '',
    price: material.price || null,
    currency: material.currency || null
  };
}
