import { FormList } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';

export function createMaterialFormGroup(material: Material) {
  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl(material.value),
    description: new FormControl(material.description),
    step: new FormControl(material.step),
    category: new FormControl(material.category),
    price: new FormControl(material.price),
    currency: new FormControl(material.currency),
    isOrdered: new FormControl(material.isOrdered),
    isPaid: new FormControl(material.isPaid),
    status: new FormControl(material.status),
    owner: new FormControl(material.owner),
    storage: new FormControl(material.storage)
  });
}

export function createMaterialFormList() {
  return FormList.factory([], createMaterialFormGroup);
}
