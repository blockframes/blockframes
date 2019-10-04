import { MovieSalesCast, Credit, createMovieSalesCast, createCredit } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MovieCreditForm } from '../main/main.form';

function createMovieSalesCastControls(salesCast: Partial<MovieSalesCast> = {}){
  const entity = createMovieSalesCast(salesCast);
  return {
    credits: FormList.factory(entity.credits, el => new MovieCreditForm(el)),
  }
}

type MovieSalesCastControl = ReturnType<typeof createMovieSalesCastControls>

export class MovieSalesCastForm extends FormEntity<MovieSalesCastControl>{
  constructor(salesCast : MovieSalesCast) {
    super(createMovieSalesCastControls(salesCast));
  }

  get credits() {
    return this.get('credits');
  }

  public addCredit(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new FormEntity<Credit>({
      firstName: new FormControl(entity.firstName),
      lastName: new FormControl(entity.lastName),
      creditRole: new FormControl(entity.creditRole),
    });
    this.credits.push(creditControl);
  }

  public removeCredit(i: number): void {
    this.credits.removeAt(i);
  }

}
