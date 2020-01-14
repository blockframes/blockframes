import { MovieFestivalPrizes, createMovieFestivalPrizes, Prize, createPrize } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, logo, premiere } = createPrize(entity);
  return {
    name: new FormControl(name),
    year: new FormControl(year),
    prize: new FormControl(prize),
    logo: new FormControl(logo),
    premiere: new FormControl(premiere),
  }
}

type PrizeFormControl = ReturnType<typeof createPrizeFormControl>;

export class MoviePrizeForm extends FormEntity<PrizeFormControl> {
  constructor(prize?: Prize) {
    super(createPrizeFormControl(prize));
  }
}

function createMovieFestivalPrizesControls(festivalprizes?: Partial<MovieFestivalPrizes>) {
  const entity = createMovieFestivalPrizes(festivalprizes);
  return {
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el))
  }
}

type MovieFestivalPrizesControl = ReturnType<typeof createMovieFestivalPrizesControls>

export class MovieFestivalPrizesForm extends FormEntity<MovieFestivalPrizesControl>{

  constructor(story?: MovieFestivalPrizes) {
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

  public setImage(image: string, index: number): void {
    this.prizes.controls[index].get('logo').setValue(image);
  }

  public removeImage(index: number): void {
    this.prizes.controls[index].get('logo').setValue('');
  }

}
