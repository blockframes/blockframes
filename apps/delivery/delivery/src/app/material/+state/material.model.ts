// tslint:disable-next-line: interface-over-type-literal
export type Material = {
  id: string;
  category: string;
  value: string;
  description: string;
  delivered: boolean;
  deliveriesIds: string[];
};

export function createMaterial(material: Partial<Material>) {
  return material ? {
    category: '',
    value: '',
    description: '',
    ...material
  } as Material : {} as Material
}


