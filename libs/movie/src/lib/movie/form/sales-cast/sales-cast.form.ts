import { MovieSalesCast } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { FormArray, FormBuilder } from '@angular/forms';

/* @todo #643
FormControl => FieldControl
FormArray => FormList
FormGroup => EntityForm
*/
function createMovieSalesCastControls() {

  return {
    credits: new FormArray([]),
  }
}

type MovieSalesCastControl = ReturnType<typeof createMovieSalesCastControls>

export class MovieSalesCastForm extends FormEntity<Partial<MovieSalesCast>, MovieSalesCastControl>{
  protected builder: FormBuilder; //@todo #643 no more builder group
  constructor() {
    super(createMovieSalesCastControls());
    this.builder = new FormBuilder;
  }

  get credits() {
    return this.get('credits') as FormArray;
  }

  public populate(movieSalesCast: MovieSalesCast) {
    if (movieSalesCast.credits && movieSalesCast.credits.length) {
      movieSalesCast.credits.forEach((credit) => {
        this.credits.push(this.builder.group(credit));
      })
    }

  }

  public addCredit(): void {
    const defaultFormGroup = { firstName: '', lastName: '', creditRole: '' };
    this.credits.push(this.builder.group(defaultFormGroup));
  }

  //@todo #643 factorize 
  public removeCredit(i: number): void {
    this.credits.removeAt(i);
  }

}