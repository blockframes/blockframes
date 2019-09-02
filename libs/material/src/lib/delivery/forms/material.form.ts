import { FormList } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';

export function createMaterialFormGroup(material: Material, disabled = false) {
  // This change the value into an object with 'value' and 'disabled' properties
  const withDisabled = value => ({
    disabled, value
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
