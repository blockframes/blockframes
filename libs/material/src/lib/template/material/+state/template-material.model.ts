import { staticModels } from "@blockframes/movie";
import { Material } from "../../../material/+state";

type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];

export interface MaterialRaw {
  id: string;
  value: string;
  description: string;
  category: string;
}

export interface MaterialTemplate extends MaterialRaw {
  price: number;
  currency: CurrencyCode;
}

export function createMaterialTemplate(material: Partial<MaterialTemplate>): MaterialTemplate {
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

export function convertMaterialToMaterialTemplate(material: Partial<Material>): MaterialTemplate {
  return {
    id: material.id,
    category: material.category,
    value: material.value,
    description: material.description,
    price: material.price,
    currency: material.currency
  };
}
