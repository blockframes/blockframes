
import { FormControl } from '@angular/forms';

import { RightholderRole, createWaterfallRightholder } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';


export interface WaterfallRightholderFormValue {
  id: string;
  name: string;
  roles: RightholderRole[];
  lockedVersionId?: string;
}

function createWaterfallRightholderFormControl(rightholder?: Partial<WaterfallRightholderFormValue>) {
  return {
    id: new FormControl(rightholder?.id ?? ''),
    name: new FormControl(rightholder?.name ?? ''),
    roles: new FormControl(rightholder?.roles ?? []),
    lockedVersionId: new FormControl(rightholder?.lockedVersionId ?? ''),
  }
}

type WaterfallRightholderFormControl = ReturnType<typeof createWaterfallRightholderFormControl>;

export class WaterfallRightholderForm extends FormEntity<WaterfallRightholderFormControl> {
  constructor(rightholder?: Partial<WaterfallRightholderFormValue>) {
    super(createWaterfallRightholderFormControl(rightholder))
  }

  setValue(_rightholder?: Partial<WaterfallRightholderFormValue>) {
    const rightholder = createWaterfallRightholder(_rightholder);
    if (!rightholder.lockedVersionId) rightholder.lockedVersionId = '';
    super.setValue(rightholder);
  }
}