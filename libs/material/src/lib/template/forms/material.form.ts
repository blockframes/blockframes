import { FormBatch, FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MaterialTemplate, createMaterialTemplate } from '../../material/+state';

function createMaterialControl(material: Partial<MaterialTemplate> = {}) {
  const entity = createMaterialTemplate(material);
  return {
    id: new FormControl(entity.id),
    value: new FormControl(entity.value),
    description: new FormControl(entity.description),
    price: new FormControl(entity.price),
    currency: new FormControl(entity.currency),
    category: new FormControl(entity.category)
  };
}

export type MaterialControl = ReturnType<typeof createMaterialControl>;

export class MaterialForm extends FormBatch<MaterialTemplate, MaterialControl> {
  constructor(material?: Partial<MaterialTemplate>) {
    const controls: MaterialControl = createMaterialControl(material);
    super(controls);
  }

  createControl(material?: Partial<MaterialTemplate>) {
    const controls = createMaterialControl(material);
    return new FormEntity<MaterialControl>(controls);
  }
}
