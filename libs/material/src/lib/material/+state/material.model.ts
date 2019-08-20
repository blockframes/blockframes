import { Step } from "../../delivery/+state";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  owner: string;
  step?: Step,
  state?: State,
  deliveriesIds?: string[];
  price?: number;
  isOrdered?: boolean;
  isPaid?: boolean;
  storage?: string;
}

export const enum State {
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
    owner: material.owner,
    step: material.step || {id: '', date: undefined, name: ''},
    ...material
  }
}
