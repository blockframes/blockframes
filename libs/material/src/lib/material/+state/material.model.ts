import { Delivery } from '../../delivery/+state';
import { MaterialStatus, MaterialDocument, MaterialTemplateDocument } from './material.firestore';

export { MaterialStatus, MaterialTemplateDocument } from './material.firestore';

export type MaterialTemplate = MaterialTemplateDocument

export type Material = MaterialDocument;

export const materialStatuses: MaterialStatus[] = [
  MaterialStatus.pending,
  MaterialStatus.available,
  MaterialStatus.delivered
];

// TODO: Type safety => ISSUE#774
export function createMaterial(material: Partial<Material>): Material {
  return {
    id: material.id,
    category: '',
    value: '',
    description: '',
    status: material.status || MaterialStatus.pending,
    isOrdered: false,
    isPaid: false,
    deliveryIds: [],
    ...material
  };
}

export function getMaterialStep(material: Material, delivery: Delivery) {
  return {
    ...material,
    step: delivery.steps.find(deliveryStep =>
      material.stepId ? deliveryStep.id === material.stepId : null
    )
  };
}

/** A factory function that creates a Material Template */
export function createMaterialTemplate(material: Partial<MaterialTemplate> | Partial<MaterialDocument>): MaterialTemplate {
  return {
    id: material.id,
    category: material.category || '',
    value: material.value || '',
    description: material.description || '',
    price: material.price || null,
    currency: material.currency || null
  };
}

/**  Checks properties of two material to tell if they are the same or not. */
export function isTheSame(matA: Material, matB: Material): boolean {
  const getProperties = ({ value, description, category, stepId }: Material) => ({
    value,
    description,
    category,
    stepId
  });
  return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
}
