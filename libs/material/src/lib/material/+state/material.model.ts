export interface Material {
  id: string;
  category: string;
  value: string;
  description: string;
  step?: string,
  delivered: boolean;
  deliveriesIds: string[];
}

export interface MaterialForm {
  value: string;
  description: string;
  category: string;
}

export interface MaterialDeliveryForm {
  value: string;
  description: string;
  category: string;
  step: string;
}

export function createMaterial(material: Partial<Material>) {
  return material ? {
    category: '',
    value: '',
    description: '',
    ...material
  } as Material : {} as Material
}


