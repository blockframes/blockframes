import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FormEntity, FormStaticValueArray } from "@blockframes/utils/form";
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';
import { createHoldback, Holdback } from "../+state";

function createHoldbackControl(params: Partial<Holdback> = {}) {
  const fromValidators = [compareDates('from', 'to', 'from'), isDateInFuture, Validators.required];
  const toValidators = [compareDates('from', 'to', 'to'), isDateInFuture, Validators.required];

  const term = createHoldback(params);
  return {
    territories: new FormStaticValueArray<'territories'>(term.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(term.medias, 'medias'),
    duration: new FormGroup({
      from: new FormControl(term.duration?.from, fromValidators),
      to: new FormControl(term.duration?.to, toValidators)
    }),
  }
}

type HoldbackControl = ReturnType<typeof createHoldbackControl>

export class HoldbackForm extends FormEntity<HoldbackControl, Holdback> {
  constructor(term: Partial<Holdback> = {}) {
    super(createHoldbackControl(term))
  }
}
