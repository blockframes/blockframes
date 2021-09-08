import { FormControl, FormGroup } from "@angular/forms";
import { FormEntity, FormStaticValueArray } from "@blockframes/utils/form";
import { createHoldback, Holdback } from "../+state";

function createHoldbackControl(params: Partial<Holdback> = {}) {
  const term = createHoldback(params);
  return {
    territories: new FormStaticValueArray<'territories'>(term.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(term.medias, 'medias'),
    duration: new FormGroup({
      from: new FormControl(term.duration?.from),
      to: new FormControl(term.duration?.to)
    }),
  }
}

type HoldbackControl = ReturnType<typeof createHoldbackControl>

export class HoldbackForm extends FormEntity<HoldbackControl, Holdback> {
  constructor(term: Partial<Holdback> = {}) {
    super(createHoldbackControl(term))
  }
}
