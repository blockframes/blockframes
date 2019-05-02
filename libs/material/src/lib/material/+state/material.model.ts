import { Step } from "../../delivery/+state";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  stepId: string;
  step?: Step,
  state?: string,
  approved: boolean;
  deliveriesIds: string[];
}

export interface MaterialTemplateForm {
  value: string;
  description: string;
  category: string;
}

export interface MaterialDeliveryForm {
  value: string;
  description: string;
  category: string;
  stepId: string;
}

export function createMaterial(material: Partial<Material>) {
  return material ? {
    category: '',
    value: '',
    description: '',
    ...material
  } as Material : {} as Material
}


