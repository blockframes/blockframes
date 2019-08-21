import { Step } from "../../delivery/+state";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  owner: string;
  step?: Step;
  status?: MaterialStatus;
  deliveryIds?: string[];
  price?: {
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

export function createMaterial(material: Partial<Material>): Material {
  return {
    id: material.id,
    category: material.category || null,
    value: material.value || null,
    description: material.description || null,
    owner: material.owner || null,
    step: material.step || {id: null, date: null, name: null},
    ...material
  }
}
