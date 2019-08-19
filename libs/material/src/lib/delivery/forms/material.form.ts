import { FormList } from "@blockframes/utils";
import { FormControl, FormGroup } from "@angular/forms";
import { Material } from '@blockframes/material';

function createMaterialFormGroup(material: Material) {
  return new FormGroup({
    id: new FormControl(material.id),
    value: new FormControl(material.value),
    description: new FormControl(material.description),
    step: new FormControl(material.step),
    category: new FormControl(material.category),
  });
}

export function createMaterialFormList() {
  return FormList.factory([], createMaterialFormGroup);
}
