import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';


function createAvailControl(mode: 'single' | 'multi', avail: Partial<AvailsFilter> = {}) {
  const controls = {
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias', [Validators.required]),
    exclusive: new FormControl(avail.exclusive ?? true, Validators.required),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from, [Validators.required, compareDates('from', 'to', 'from'), isDateInFuture]),
      to: new FormControl(avail.duration?.to, [Validators.required, compareDates('from', 'to', 'to'), isDateInFuture])
    })
  } as any;

  if (mode === 'multi') {
    controls.territories = new FormStaticValueArray<'territories'>(avail.territories, 'territories', [Validators.required]);
  }

  return controls;
}

type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(mode: 'single' | 'multi' = 'multi', avail: Partial<AvailsFilter> = {}) {
    super(createAvailControl(mode, avail))
  }
}