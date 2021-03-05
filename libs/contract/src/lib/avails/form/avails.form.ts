import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup, Validators } from '@angular/forms';

function createAvailControl(avail: Partial<AvailsFilter> = {}) {
  return {
    territories: new FormStaticValueArray<'territories'>(avail.territories, 'territories', [Validators.required]),
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias', [Validators.required]),
    exclusive: new FormControl(avail.exclusive ?? true, Validators.required),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from, Validators.required),
      to: new FormControl(avail.duration?.to, Validators.required)
    })
  }
}

type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = {}) {
    super(createAvailControl(avail))
  }
}