import { Step, Delivery } from "../../delivery/+state";

export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  stepId?: string;
  step?: Step,
  state?: string,
  approved?: boolean;
  deliveriesIds?: string[];
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
  step: Step;
}

export function createMaterial(material: Partial<Material>) {
  return material ? {
    category: '',
    value: '',
    description: '',
    step: {},
    ...material
  } as Material : {} as Material
}

export function getMaterialStep(material: Material, delivery: Delivery) {
  return ({
    ...material,
    step: delivery.steps.find(step => step.id === material.stepId)
  })
}

