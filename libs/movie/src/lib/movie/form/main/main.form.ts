import { MovieMain, Movie, Credit, createMovieMain } from '../../+state';
import { FormEntity, FormList, YearControl, FormField } from '@blockframes/utils';
import { Validators, FormControl } from '@angular/forms';


function createCreditFormControl(credit? : Partial<Credit>) {
  return {
    firstName: new FormControl(credit.firstName),
    lastName: new FormControl(credit.lastName),
    creditRole: new FormControl(credit.creditRole),
  }
}

type CreditFormControl = ReturnType<typeof createCreditFormControl>;

export class MovieCreditForm extends FormEntity<Credit,CreditFormControl> {
  constructor(credit: Credit) {
    super(createCreditFormControl(credit));
  }
}

function createMovieMainControls(main? : Partial<MovieMain> ) {
  const entity = createMovieMain(main);
  return {
    internalRef: new FormField(entity.internalRef),
    isan: new FormField(entity.isan),
    title: new FormEntity<Movie['main']['title']>({
      original: new FormField(entity.title.original),
      international: new FormField(entity.title.international),
    }),
    directors: FormList.factory(entity.directors, el => new MovieCreditForm(el)),
    poster: new FormField(entity.poster),
    productionYear: new YearControl(entity.productionYear),
    genres: new FormField(entity.genres),
    originCountry: new FormField(entity.originCountry),
    languages: new FormField(entity.languages),
    status: new FormField(entity.status , [Validators.required]),
    length: new FormField<number>(entity.length),
    shortSynopsis: new FormField(entity.shortSynopsis, [Validators.maxLength(500)] ),
    productionCompanies: FormList.factory(entity.productionCompanies, el => new MovieCreditForm(el)),
  }
}

type MovieMainControl = ReturnType<typeof createMovieMainControls>

export class MovieMainForm extends FormEntity<Partial<MovieMain>, MovieMainControl>{
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

  public addDirector(): void {
    const credit = new FormEntity<Credit>({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
    });
    this.directors.push(credit);
  }

  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

  public addProductionCompany(): void {
    const credit = new FormEntity<Credit>({
      firstName: new FormControl(''),
    });
    this.productionCompanies.push(credit);
  }

  public removeProductionCompany(i: number): void {
    this.productionCompanies.removeAt(i);
  }

}