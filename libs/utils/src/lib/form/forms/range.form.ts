import { FormControl } from '@angular/forms';
import { createRange, RawRange } from '../../common-interfaces';
import { validRange } from '../validators/validators'
import { FormEntity } from './entity.form';

function createRangeControl<D>(value: RawRange<D>) {
  const { from, to } = createRange<D>(value);
  return {
    from: new FormControl(from),
    to: new FormControl(to),
  }
}

type RangeControl = ReturnType<typeof createRangeControl>;

export class NumberRangeForm extends FormEntity<RangeControl> {

  constructor(range: RawRange<Number>) {
    super(createRangeControl(range), validRange);
  }
}