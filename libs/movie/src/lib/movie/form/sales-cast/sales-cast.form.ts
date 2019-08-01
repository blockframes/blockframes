import { MovieSalesCast, Credit, createMovieSalesCast } from '../../+state';
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

export class MovieSalesCastForm extends FormEntity<Partial<MovieSalesCast>, MovieSalesCastControl>{
  constructor(salesCast : MovieSalesCast) {
    super(createMovieSalesCastControls(salesCast));
  }

  get credits() {
    return this.get('credits');
  }

  public addCredit(): void {
    const credit = new FormEntity<Credit>({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      creditRole: new FormControl(''),
    });
    this.credits.push(credit);
  }

  public removeCredit(i: number): void {
    this.credits.removeAt(i);
  }

}