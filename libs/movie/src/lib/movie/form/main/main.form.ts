import { MovieMain, Movie, Credit } from '../../+state';
import { FormEntity, FormList, YearControl, FormField } from '@blockframes/utils';
import { Validators, FormControl } from '@angular/forms';


interface MovieCreditFormControl {
  firstName: FormControl,
  lastName?: FormControl,
  creditRole?: FormControl,
}

export class MovieCreditForm extends FormEntity<Credit,MovieCreditFormControl> {
  constructor(credit: Credit) {
    super({
      firstName: new FormControl(credit.firstName),
      lastName: new FormControl(credit.lastName),
      creditRole: new FormControl(credit.creditRole),
    });
  }
}

function createMovieMainControls(main? : MovieMain ) {

  return {
    internalRef: new FormField<string>(main.internalRef),
    title: new FormEntity<Movie['main']['title']>({
      original: new FormField<string>(main.title.original),
      international: new FormField<string>(main.title.international),
    }),
    directors: FormList.factory(main.directors || [], el => new MovieCreditForm(el)),
    poster: new FormField<string>(main.poster),
    productionYear: new YearControl(main.productionYear),
    genres: new FormField<string[]>(main.genres || [] ),
    originCountry: new FormField<string>(main.originCountry),
    languages: new FormField<string[]>(main.languages || []),
    status: new FormField<string>(main.status , [Validators.required]),
    length: new FormField<number>(main.length),
    shortSynopsis: new FormField<string>(main.shortSynopsis, [Validators.maxLength(500)] ),
    productionCompanies: FormList.factory(main.productionCompanies || [], el => new MovieCreditForm(el)),
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