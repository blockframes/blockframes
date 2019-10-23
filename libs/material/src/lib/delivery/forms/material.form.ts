import { FormBatch, FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { Material } from '@blockframes/material';
import { createMaterial } from '../../material/+state';

function createMaterialControl(material: Partial<Material> = {}) {
  const entity = createMaterial(material);
  return {
    id: new FormControl(entity.id),
    value: new FormControl(entity.value),
    description: new FormControl(entity.description),
    stepId: new FormControl(entity.stepId || null),
    category: new FormControl(entity.category),
    price: new FormControl(entity.price || null),
    currency: new FormControl(entity.currency || null),
    isOrdered: new FormControl(entity.isOrdered),
    isPaid: new FormControl(entity.isPaid),
    status: new FormControl(entity.status),
    owner: new FormControl(entity.owner),
    storage: new FormControl(entity.storage)
  };
}

export type MaterialControl = ReturnType<typeof createMaterialControl>;

export class MaterialForm extends FormBatch<Material, MaterialControl> {
  constructor(material?: Partial<Material>) {
    const controls: MaterialControl = createMaterialControl(material);
    super(controls);
  }

  createControl(material: Partial<Material>) {
    const controls = createMaterialControl(material);
    return new FormEntity<MaterialControl>(controls);
  }
}
