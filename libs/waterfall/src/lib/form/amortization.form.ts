
import { FormControl, Validators } from '@angular/forms';
import { Amortization } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';

function createAmortizationFormControl(changes?: Partial<Amortization>) {
  return {
    id: new FormControl<string>(changes?.id ?? '', [Validators.required]),
    name: new FormControl<string>(changes?.name ?? '', [Validators.required]),
    contractIds: new FormControl<string[]>(changes?.contractIds ?? [], [Validators.required]),
    filmCost: new FormControl<number>(changes?.filmCost ?? 0, [Validators.required]),
    financing: new FormControl<number>(changes?.financing ?? 0, [Validators.required]),
    poolName: new FormControl<string>(changes?.poolName ?? '', [Validators.required]),
  };
}

type AmortizationFormControl = ReturnType<typeof createAmortizationFormControl>;

export class AmortizationForm extends FormEntity<AmortizationFormControl> {
  constructor(changes?: Partial<Amortization>) {
    super(createAmortizationFormControl(changes));
  }
}