import { MovieSalesCast, Credit, createMovieSalesCast } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MovieCreditForm } from '../main/main.form';
import { createCredit } from '@blockframes/utils/common-interfaces/identity';

function createMovieSalesCastControls(salesCast?: Partial<MovieSalesCast>){
  const entity = createMovieSalesCast(salesCast);
  return {
    credits: FormList.factory(entity.credits, el => new MovieCreditForm(el)),
  }
}

type MovieSalesCastControl = ReturnType<typeof createMovieSalesCastControls>

function createCreditControls(credit?: Partial<Credit>) {
  const { firstName, lastName, role } = createCredit(credit);
  return {
    firstName: new FormControl(firstName),
    lastName: new FormControl(lastName),
    role: new FormControl(role),
  }
}

type CreditControl = ReturnType<typeof createCreditControls>;

export class CreditForm extends FormEntity<CreditControl>{
  constructor(credit?: Credit) {
    super(createCreditControls(credit));
  }
}

export class MovieSalesCastForm extends FormEntity<MovieSalesCastControl>{
  constructor(salesCast?: MovieSalesCast) {
    super(createMovieSalesCastControls(salesCast));
  }

  get credits() {
    return this.get('credits');
  }

  public addCredit(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new CreditForm(entity);
    this.credits.push(creditControl);
  }

  public removeCredit(i: number): void {
    this.credits.removeAt(i);
  }

}
