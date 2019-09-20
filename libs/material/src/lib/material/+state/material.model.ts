import { Step, Delivery, StepRaw } from '../../delivery/+state';
import { staticModels } from '@blockframes/movie';
import { firestore } from 'firebase';
type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];
type Timestamp = firestore.Timestamp;
// TODO: Create "Price" type with currencies from static-models => ISSUE#818

interface MaterialRaw<D> {
  id: string;
  category: string;
  value: string;
  description: string;
  owner?: string;
  stepId?: string;
  step?: StepRaw<D>;
  status?: MaterialStatus;
  deliveryIds?: string[];
  price?: number; // TODO: Create "Price" type with currencies from static-models => ISSUE#818
  currency?: CurrencyCode;
  isOrdered?: boolean;
  isPaid?: boolean;
  storage?: string;
}

interface Material2 extends MaterialRaw<Date> {
  step: StepRaw<Date>;
}

interface Material2DB extends MaterialRaw<Timestamp> {
  stepId: string;
}

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
  // Change the step of a material by the step of delivery
  // TODO: issue #779, juste save the stepId in the database
  return {
    ...material,
    step: delivery.steps.find(step =>
      material.step ? step.id === material.step.id : null)
      ? delivery.steps.find(step => material.step ? step.id === material.step.id : null)
      : null
  };
}
