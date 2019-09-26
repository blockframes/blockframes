import { MovieFestivalPrizes, createMovieFestivalPrizes, Prize } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { FormControl } from '@angular/forms';

function createPrizeFormControl(prize : Partial<Prize> = {}) {
  return {
    name: new FormControl(prize.name),
    year: new FormControl(prize.year),
    prize: new FormControl(prize.prize),
  }
}

type PrizeFormControl = ReturnType<typeof createPrizeFormControl>;

export class MoviePrizeForm extends FormEntity<Prize,PrizeFormControl> {
  constructor(prize: Prize) {
    super(createPrizeFormControl(prize));
  }
}

function createMovieFestivalPrizesControls(festivalprizes: Partial<MovieFestivalPrizes> = {}) {
  const entity = createMovieFestivalPrizes(festivalprizes);
  return {
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el))
  }
}

type MovieFestivalPrizesControl = ReturnType<typeof createMovieFestivalPrizesControls>

export class MovieFestivalPrizesForm extends FormEntity<Partial<MovieFestivalPrizes>, MovieFestivalPrizesControl>{

  constructor(story: MovieFestivalPrizes) {
    super(createMovieFestivalPrizesControls(story));
  }

  get prizes() {
    return this.get('prizes');
  }

  public addPrize(): void {
    const credit = new FormEntity<Prize>({
      name: new FormControl(''),
      year: new FormControl(''),
      prize: new FormControl(''),
    });
    this.prizes.push(credit);
  }

  public removePrize(i: number): void {
    this.prizes.removeAt(i);
  }

}
