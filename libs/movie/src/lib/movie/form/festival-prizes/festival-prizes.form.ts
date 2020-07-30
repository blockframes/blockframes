import { Prize, Movie } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils/form/forms';
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

export function createMovieFestivalPrizes(
  params: Partial<Movie> = {}
): Partial<Movie> {
  return {
    prizes: [],
    ...params
  };
}

function createMovieFestivalPrizesControls(festivalprizes?: Partial<Movie>) {
  const entity = createMovieFestivalPrizes(festivalprizes);
  return {
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el))
  }
}

export type MovieFestivalPrizesControl = ReturnType<typeof createMovieFestivalPrizesControls>

export class MovieFestivalPrizesForm extends FormEntity<MovieFestivalPrizesControl>{

  constructor(story?: Movie) {
    super(createMovieFestivalPrizesControls(story));
  }

  get prizes() {
    return this.get('prizes');
  }

  public getPrize(i: number) {
    return this.prizes.controls[i];
  }

  public addPrize(): void {
    const credit = new MoviePrizeForm();
    this.prizes.push(credit);
  }

  public removePrize(i: number): void {
    this.prizes.removeAt(i);
  }

}
