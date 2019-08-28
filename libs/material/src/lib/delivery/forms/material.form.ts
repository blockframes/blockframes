import { FormList } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';

export function createMaterialFormGroup(material: Material) {
  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl({value: material.value, disabled: false}),
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

export function createSignedMaterialFormGroup(material: Material) {
  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl({value: material.value, disabled: true}),
    description: new FormControl({value: material.description, disabled: true}),
    step: new FormControl({value: material.step, disabled: true}),
    category: new FormControl({value: material.category, disabled: true}),
    price: new FormControl({value: material.price, disabled: true}),
    currency: new FormControl({value: material.currency, disabled: true}),
    isOrdered: new FormControl(material.isOrdered),
    isPaid: new FormControl(material.isPaid),
    status: new FormControl(material.status),
    owner: new FormControl(material.owner),
    storage: new FormControl(material.storage)
  });
}

export function createSignedMaterialFormList() {
  return FormList.factory([], createSignedMaterialFormGroup);
}
