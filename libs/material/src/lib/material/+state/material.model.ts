import { Step } from "../../delivery/+state";
import { utils } from "ethers";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  owner?: string;
  step?: Step;
  status: MaterialStatus;
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

// TODO: Type safety => ISSUE#774
export function createMaterial(material: Partial<Material>): Material {
  return {
    id: material.id,
    category: '',
    value: '',
    description: '',
    status: material.status || MaterialStatus.pending,
    ...material
  }
}
