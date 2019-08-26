import { Step, Delivery } from '../../delivery/+state';
import * as firebase from 'firebase/app';

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  owner?: string;
  stepId?: string;
  step?: Step;
  status: MaterialStatus;
  deliveryIds?: string[];
  price?: { // TODO: Create "Price" type with currencies from static-models => ISSUE#816
    amount: number;
    currency: string;
  };
  isOrdered?: boolean;
  isPaid?: boolean;
  storage?: string;
}

export const enum MaterialStatus {
  pending = 'pending',
  available = 'available',
  delivered = 'delivered'
}

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
    ...material
  };
}

export function getMaterialStep(material: Material, delivery: Delivery) {
  return {
    ...material,
    step: delivery.steps.find(step => step.id === material.stepId)
  };
}
