import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { createHoldback, Holdback } from '@blockframes/model';
import { FormEntity, FormStaticValueArray } from '@blockframes/utils/form';
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';

function createHoldbackControl(params: Partial<Holdback> = {}) {
  const fromValidators = [compareDates('from', 'to', 'from'), isDateInFuture, Validators.required];
  const toValidators = [compareDates('from', 'to', 'to'), isDateInFuture, Validators.required];

  const term = createHoldback(params);
  return {
    territories: new FormStaticValueArray<'territories'>(term.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(term.medias, 'medias'),
    duration: new UntypedFormGroup({
      from: new UntypedFormControl(term.duration?.from, fromValidators),
      to: new UntypedFormControl(term.duration?.to, toValidators)
    }),
  }
}

type HoldbackControl = ReturnType<typeof createHoldbackControl>

export class HoldbackForm extends FormEntity<HoldbackControl, Holdback> {
  constructor(term: Partial<Holdback> = {}) {
    super(createHoldbackControl(term));
  }
}
