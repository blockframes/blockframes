import { Step, Delivery } from '../../delivery/+state';
import { staticModels } from '@blockframes/movie';
type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];
// TODO: Create "Price" type with currencies from static-models => ISSUE#818

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
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
]

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
    status: material.status|| MaterialStatus.pending,
    isOrdered: false,
    isPaid: false,
    ...material
  };
}

export function createTemplateMaterial(material: Partial<Material>): Material {
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

export function getMaterialStep(material: Material, delivery: Delivery) {
  return {
    ...material,
    step: delivery.steps.find(step =>
      material.step ? step.id === material.step.id : null)
      ? delivery.steps.find(step => material.step ? step.id === material.step.id : null)
      : null
  };
}
