
import { FormControl } from '@angular/forms';
import { RightOverride } from '@blockframes/model';
import { FormEntity, FormList } from '@blockframes/utils/form';

export type RightOverrideAmount = (Omit<RightOverride, 'percent'> & { amount: number });

function createRightOverrideControl(orverride?: Partial<RightOverrideAmount>) {
  return {
    incomeId: new FormControl<string>(orverride?.incomeId ?? ''),
    rightId: new FormControl<string>(orverride?.rightId ?? ''),
    amount: new FormControl<number>(orverride?.amount ?? 0),
    comment: new FormControl<string>(orverride?.comment),
  };
}

type RightOverrideControl = ReturnType<typeof createRightOverrideControl>;

class RightOverrideForm extends FormEntity<RightOverrideControl> {
  constructor(orverride?: Partial<RightOverride>) {
    super(createRightOverrideControl(orverride));
  }
}

interface ArbitraryChange {
  overrides: RightOverrideAmount[],
  confirm: string,
}

function createArbitraryChangeFormControl(abitraryChanges?: Partial<ArbitraryChange>) {
  const controls = {
    overrides: FormList.factory(abitraryChanges?.overrides, (el) => new RightOverrideForm(el)),
    confirm: new FormControl<string>(abitraryChanges?.confirm ?? '')
  };
  return controls;
}

type ArbitraryChangeFormControl = ReturnType<typeof createArbitraryChangeFormControl>;

export class ArbitraryChangeForm extends FormEntity<ArbitraryChangeFormControl> {
  constructor(abitraryChanges?: Partial<ArbitraryChange>) {
    super(createArbitraryChangeFormControl(abitraryChanges));
  }
}