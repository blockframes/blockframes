
import { FormControl } from '@angular/forms';
import { Amortization } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';

function createAmortizationFormControl(changes?: Partial<Amortization>) {
  return {
    id: new FormControl<string>(changes?.id ?? ''),
    name: new FormControl<string>(changes?.name ?? ''),
    contractIds: new FormControl<string[]>(changes?.contractIds ?? []),
  };
}

type AmortizationFormControl = ReturnType<typeof createAmortizationFormControl>;

export class AmortizationForm extends FormEntity<AmortizationFormControl> {
  constructor(changes?: Partial<Amortization>) {
    super(createAmortizationFormControl(changes));
  }
}