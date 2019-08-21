import { Step } from "../../delivery/+state";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  owner: string;
  step?: Step,
  status?: MaterialStatus,
  deliveriesIds?: string[];
  price?: number;
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
    category: material.category || '',
    value: material.value || '',
    description: material.description || '',
    owner: material.owner || '',
    step: material.step || {id: '', date: null, name: ''},
    ...material
  }
}
