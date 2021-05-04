import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';


function createAvailControl(avail: Partial<AvailsFilter> = {}, required: ('territories' | 'duration')[]) {
  const durationRequired = required.includes('duration') ? [Validators.required] : []
  return {
    territories: new FormStaticValueArray<'territories'>(avail.territories, 'territories', required.includes('territories') ? [Validators.required] : []),
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias', [Validators.required]),
    exclusive: new FormControl(avail.exclusive ?? true, Validators.required),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from, [...[compareDates('from', 'to', 'from'), isDateInFuture], ...durationRequired]),
      to: new FormControl(avail.duration?.to, [...[compareDates('from', 'to', 'to'), isDateInFuture], ...durationRequired])
    })
  };
}

type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = {}, required: ('territories' | 'duration')[]) {
    super(createAvailControl(avail, required))
  }
}