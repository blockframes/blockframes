import { Prize } from '../../+state';
import { FormEntity } from '@blockframes/utils/form/forms';
import { FormControl } from '@angular/forms';
import { yearValidators } from '@blockframes/utils/form/validators';
import { createHostedMedia } from '@blockframes/media/+state/media.model';

// TODO #2284
function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, logo, premiere } = createPrize(entity);
  return {
    name: new FormControl(name),
    year: new FormControl(year, [yearValidators]),
    prize: new FormControl(prize),
    logo: new FormControl(logo),
    premiere: new FormControl(premiere),
  }
}

type PrizeFormControl = ReturnType<typeof createPrizeFormControl>;

export class MoviePrizeForm extends FormEntity<PrizeFormControl> {
  constructor(prize?: Partial<Prize>) {
    super(createPrizeFormControl(prize));
  }
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    logo: createHostedMedia(),
    ...prize
  };
}
