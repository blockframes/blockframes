import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { AvailsFilter } from '../avails';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormControl, FormGroup, Validators } from '@angular/forms';

function compareDates(form: FormControl) {
  const eventForm = form?.parent as FormGroup;
  if (eventForm) {
    const { from, to } = eventForm.value;
    if (from && to && from > to) {
      return { startOverEnd: true }
    }
  }
  return null;
}

function inFuture(form: FormControl) {
  const now = new Date()
  now.setHours(0, 0, 0)
  if (form.value < now) {
    return { inPast: true }
  }
  return null;
}

function createAvailControl(avail: Partial<AvailsFilter> = {}) {
  return {
    territories: new FormStaticValueArray<'territories'>(avail.territories, 'territories', [Validators.required]),
    medias: new FormStaticValueArray<'medias'>(avail.medias, 'medias', [Validators.required]),
    exclusive: new FormControl(avail.exclusive ?? true, Validators.required),
    duration: new FormGroup({
      from: new FormControl(avail.duration?.from, [Validators.required, compareDates, inFuture]),
      to: new FormControl(avail.duration?.to, [Validators.required, compareDates, inFuture])
    })
  }
}

type AvailControl = ReturnType<typeof createAvailControl>

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = {}) {
    super(createAvailControl(avail))
  }
}