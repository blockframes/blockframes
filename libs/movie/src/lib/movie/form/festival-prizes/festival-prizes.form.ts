import { Prize } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils/form/forms';
import { FormControl } from '@angular/forms';
import { yearValidators } from '@blockframes/utils/form/validators';

// TODO #2284
function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, logo, premiere } = entity;
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

function createMoviePrizesControls(festivalprizes) {
  const entity = festivalprizes;
  return {
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el))
  }
}

export type MoviePrizesControl = ReturnType<typeof createMoviePrizesControls>

export class MoviePrizesForm extends FormEntity<MoviePrizesControl>{

  constructor(prizes) {
    super(createMoviePrizesControls(prizes));
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

  public setImage(image: string, index: number): void {
    this.prizes.controls[index].get('logo').setValue(image);
  }

  public removeImage(index: number): void {
    this.prizes.controls[index].get('logo').setValue('');
  }

}
