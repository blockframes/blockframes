import { FormList, FormBatch } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';
import { createMaterial } from '../../material/+state';

export function createMaterialFormGroup(material: Material, disabled = false) {
  // This change the value into an object with 'value' and 'disabled' properties
  const withDisabled = value => ({
    value, disabled
  })

  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl(withDisabled(material.value)),
    description: new FormControl(withDisabled(material.description)),
    step: new FormControl(withDisabled(material.step || null)),
    category: new FormControl(withDisabled(material.category)),
    price: new FormControl(withDisabled(material.price || null)),
    currency: new FormControl(withDisabled(material.currency || null)),
    isOrdered: new FormControl(material.isOrdered),
    isPaid: new FormControl(material.isPaid),
    status: new FormControl(material.status),
    owner: new FormControl(material.owner),
    storage: new FormControl(material.storage)
  });
}

export function createMaterialFormList(disabled = false) {
  return FormList.factory([], (value) => createMaterialFormGroup(value, disabled));
}







// New formBatch ////////////////////////////////////////////////////////////////

function createMaterialControl(material: Partial<Material> = {}) {
  // This change the value into an object with 'value' and 'disabled' properties

  const entity = createMaterial(material);
  return {
    id: new FormControl(entity.id),
    value: new FormControl(entity.value),
    description: new FormControl(entity.description),
    step: new FormControl(entity.step || null),
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

type MaterialControl = ReturnType<typeof createMaterialControl>;


export class MaterialForm extends FormBatch<Material> {
  constructor(material?: Partial<Material>) {
    const controls: MaterialControl = createMaterialControl(material);
    super(controls);
  }

  createControl(material: Partial<Material>) {
    const controls = createMaterialControl(material);
    return new FormGroup(controls);
  }
}
