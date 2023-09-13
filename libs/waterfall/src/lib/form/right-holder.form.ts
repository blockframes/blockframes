
import { FormControl } from '@angular/forms';

import { RightholderRole } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';


export interface WaterfallRightholderFormValue {
  id: string;
  name: string;
  roles: RightholderRole[];
}

function createWaterfallRightholderFormControl(rightholder?: Partial<WaterfallRightholderFormValue>) {
  return {
    id: new FormControl(rightholder?.id ?? ''),
    name: new FormControl(rightholder?.name ?? ''),
    roles: new FormControl(rightholder?.roles ?? []),
  }
}

type WaterfallRightholderFormControl = ReturnType<typeof createWaterfallRightholderFormControl>;

export class WaterfallRightholderForm extends FormEntity<WaterfallRightholderFormControl> {
  constructor(rightholder?: Partial<WaterfallRightholderFormValue>) {
    super(createWaterfallRightholderFormControl(rightholder))
  }
}