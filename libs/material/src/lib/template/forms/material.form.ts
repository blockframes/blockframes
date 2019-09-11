import { FormBatch, FormField } from '@blockframes/utils';
import { FormControl, FormGroup } from '@angular/forms';
import { Material } from '@blockframes/material';

export class MaterialsFormBatch extends FormBatch<Material> {
  createControl(material: Material) {
    return new FormGroup({
      id: new FormControl(material.id),
      value: new FormControl(material.value),
      description: new FormControl(material.description),
      price: new FormField<number>(material.price),
      currency: new FormControl(material.currency),
      category: new FormControl(material.category)
    });
  }
}
