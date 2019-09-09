import { FormList, FormEntity, FormRepertory } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';

export function createMaterialFormGroup(material: Material) {
  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl(material.value),
    description: new FormControl(material.description),
    price: new FormControl(material.price),
    currency: new FormControl(material.currency),
    category: new FormControl(material.category)
  });
}

export function createMaterialFormList() {
  return FormList.factory([], createMaterialFormGroup);
}

export class MaterialsForm extends FormRepertory<Material> {
  createControl(material: Material) {
    return new FormGroup({
      id: new FormControl(material.id),
      value: new FormControl(material.value),
      description: new FormControl(material.description),
      price: new FormControl(material.price),
      currency: new FormControl(material.currency),
      category: new FormControl(material.category)
    });
  }

  createId() {
    return '';
  }
}
