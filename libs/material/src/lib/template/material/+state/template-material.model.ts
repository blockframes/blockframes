import { staticModels } from "@blockframes/movie";
import { Material } from "../../../material/+state";

type CurrencyCode = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['code'];

export interface MaterialRaw {
  id: string;
  value: string;
  description: string;
  category: string;
}

/** Extends a Material Raw with fields that are specific to Material Template. */
export interface MaterialTemplate extends MaterialRaw {
  price: number;
  currency: CurrencyCode;
}

/** A factory function that creates a Material Template */
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

/** Convert a type Material to MaterialTemplate with only the corresponding fields */
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
