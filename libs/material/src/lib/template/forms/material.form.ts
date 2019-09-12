import { FormBatch } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { createTemplateMaterial, Material } from '../../material/+state';

function createMaterialControl(material: Partial<Material> = {}) {
  const entity = createTemplateMaterial(material);
  return {
    id: new FormControl(entity.id),
    value: new FormControl(entity.value),
    description: new FormControl(entity.description),
    price: new FormControl(entity.price),
    currency: new FormControl(entity.currency),
    category: new FormControl(entity.category)
  };
}

type MaterialControl = ReturnType<typeof createMaterialControl>;

export class MaterialForm extends FormBatch<Material> {
  constructor(material?: Partial<Material>) {
    const controls: MaterialControl = createMaterialControl(material);
    super(controls);
  }

  createControl(material?: Partial<Material>) {
    const controls = createMaterialControl(material);
    return new FormGroup(controls);
  }
}
