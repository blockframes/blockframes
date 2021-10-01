import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';


function createAvailControl(avail: Partial<AvailsFilter> = {}, required: ('territories' | 'duration')[]) {
  const fromValidators = required.includes('duration') ? [compareDates('from', 'to', 'from'), isDateInFuture, Validators.required] : [];
  const toValidators = required.includes('duration') ? [compareDates('from', 'to', 'to'), isDateInFuture, Validators.required] : [];

  if (!avail.duration) {
    const date = new Date(); //--/--/--:--:--:--
    avail.duration = {
      // only the year, month and date are useful.
      from: new Date(date.getFullYear(), date.getMonth(), date.getDate()), //--/--/--:0:0:0:0,
      // only the year, month and date are useful.
      to: new Date(date.getFullYear() + 1, date.getMonth(), date.getDate()) // --/--/--:0:0:0:0,
    }
  }

  return {
    territories: new FormStaticValueArray<'territories'>(avail.territories, 'territories', required.includes('territories') ? [Validators.required] : []),
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias', [Validators.required, Validators.minLength(0)]),
    exclusive: new FormControl(avail.exclusive ?? true, Validators.required),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from, fromValidators),
      to: new FormControl(avail.duration?.to, toValidators)
    }),
  }
}

export type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = { territories: [] }, required: ('territories' | 'duration')[]) {
    super(createAvailControl(avail, required))
  }
}
