import { FormEntity, FormList, FormField, yearValidators } from '@blockframes/utils';
import { MovieMain, Credit, createMovieMain, createCredit } from '../../+state';
import { Validators, FormControl } from '@angular/forms';


function createCreditFormControl(credit : Partial<Credit> = {}) {
  return {
    firstName: new FormControl(credit.firstName),
    lastName: new FormControl(credit.lastName),
    creditRole: new FormControl(credit.creditRole),
  }
}

export type CreditFormControl = ReturnType<typeof createCreditFormControl>;

export class MovieCreditForm extends FormEntity<CreditFormControl> {
  constructor(credit: Credit) {
    super(createCreditFormControl(credit));
  }
}

function createTitleFormControl(entity : Partial<MovieMain> = {}) {
  return {
    original: new FormField(entity.title.original),
    international: new FormField(entity.title.international),
  }
}

type TitleFormControl = ReturnType<typeof createTitleFormControl>;

function createMovieMainControls(main : Partial<MovieMain> = {}) {
  const entity = createMovieMain(main);
  return {
    internalRef: new FormField(entity.internalRef),
    isan: new FormField(entity.isan),
    title: new FormEntity<TitleFormControl>({
      original: new FormField(entity.title.original),
      international: new FormField(entity.title.international),
    }),
    directors: FormList.factory(entity.directors, el => new MovieCreditForm(el)),
    poster: new FormField(entity.poster),
    productionYear: new FormControl(entity.productionYear, yearValidators),
    genres: new FormField(entity.genres),
    originCountries: new FormField(entity.originCountries),
    languages: new FormField(entity.languages),
    status: new FormField(entity.status , [Validators.required]),
    length: new FormField<number>(entity.length),
    shortSynopsis: new FormField(entity.shortSynopsis, [Validators.maxLength(500)] ),
    productionCompanies: FormList.factory(entity.productionCompanies, el => new MovieCreditForm(el)),
  }
}

type MovieMainControl = ReturnType<typeof createMovieMainControls>

export class MovieMainForm extends FormEntity<MovieMainControl>{
  constructor(main: MovieMain) {
    super(createMovieMainControls(main));
  }

  get title() {
    return this.get('title');
  }

  get directors() {
    return this.get('directors');
  }

  get productionCompanies() {
    return this.get('productionCompanies');
  }

  get shortSynopsis() {
    return this.get('shortSynopsis');
  }

  public addDirector(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new FormEntity<CreditFormControl>({
      firstName: new FormControl(entity.firstName),
      lastName: new FormControl(entity.lastName),
    });
    this.directors.push(creditControl);
  }

  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

  public addProductionCompany(): void {
    const credit = new FormEntity<CreditFormControl>({
      firstName: new FormControl(''),
    });
    this.productionCompanies.push(credit);
  }

  public removeProductionCompany(i: number): void {
    this.productionCompanies.removeAt(i);
  }

}
