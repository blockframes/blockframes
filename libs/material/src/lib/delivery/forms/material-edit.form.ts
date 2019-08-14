import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';

export interface MaterialInformations {
  value: string;
  description: string;
  category: string;
}

function createMaterialInformations(params: Partial<MaterialInformations> = {}): MaterialInformations {
  return {
    value: '',
    description: '',
    category: '',
    ...params
  };
}

function createMaterialInformationsControls(entity: Partial<MaterialInformations>) {
  const materialInformations = createMaterialInformations(entity);
  return {
    value: new FormControl(materialInformations.value),
    description: new FormControl(materialInformations.description),
    category: new FormControl(materialInformations.category),
  };
}

type InformationsControl = ReturnType<typeof createMaterialInformationsControls>;

export class MaterialInformationsForm extends FormEntity<MaterialInformations, InformationsControl> {
  constructor(data?: MaterialInformations) {
    super(createMaterialInformationsControls(data));
  }
}
