import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup } from '@angular/forms';

function createAvailControl(avail: Partial<AvailsFilter> = {}) {
  return {
    territories: new FormStaticValueArray<'territories'>(avail.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias'),
    exclusive: new FormControl(avail.exclusive ?? true),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from),
      to: new FormControl(avail.duration?.to)
    })
  }
}

type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = {}) {
    super(createAvailControl(avail))
  }
}