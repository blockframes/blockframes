import { MovieMain, Movie } from '../../+state';
import { FormEntity, StringControl, FormList, YearControl } from '@blockframes/utils';
import { FormArray, Validators, FormBuilder } from '@angular/forms';

/* @todo #643
FormControl => FieldControl
FormArray => FormList
FormGroup => EntityForm
*/
function createMovieMainControls() {

  return {
    internalRef: new StringControl(''),
    title: new FormEntity<Movie['main']['title']>({
      original: new StringControl(''),
      international: new StringControl(''),
    }),
    directors: new FormArray([]), //@todo #643 use FormList
    poster: new StringControl(''),
    productionYear: new YearControl(''),
    genres: new StringControl(''),
    originCountry: new StringControl(''),
    languages: new StringControl(''), //@todo #643 do not use stringControll
    status: new StringControl('', false, [Validators.required]),
    length: new StringControl(''),
    shortSynopsis: new StringControl(''), //@todo #643 use lenthAValidator < 500
    productionCompanies: new FormArray([]),
  }
}

type MovieMainControl = ReturnType<typeof createMovieMainControls>

export class MovieMainForm extends FormEntity<Partial<MovieMain>, MovieMainControl>{
  protected builder : FormBuilder; //@todo #643 no more builder group
  constructor() {
    super(createMovieMainControls());
    this.builder = new FormBuilder;
  }

  get title() {
    return this.get('title');
  }

  get directors() {
    return this.get('directors') as FormArray;
  }

  get productionCompanies() {
    return this.get('productionCompanies')  as FormArray;
  }

  get shortSynopsis() {
    return this.get('shortSynopsis') as StringControl;
  }

  public populate(movieMain: MovieMain) {

    this.get('internalRef').setValue(movieMain.internalRef);
    this.title.get('original').setValue(movieMain.title.original);
    this.title.get('international').setValue(movieMain.title.international);
    this.get('poster').setValue(movieMain.poster);
    this.get('productionYear').setValue(movieMain.productionYear);
    this.get('genres').setValue(movieMain.genres);
    this.get('originCountry').setValue(movieMain.originCountry);
    this.get('languages').setValue(movieMain.languages);
    this.get('status').setValue(movieMain.status);
    this.shortSynopsis.setValue(movieMain.shortSynopsis);
    this.get('length').setValue(movieMain.length);

    if (movieMain.directors && movieMain.directors.length) {
      movieMain.directors.forEach((director) => {
        this.directors.push(this.builder.group(director))
      })
    }

    if (movieMain.productionCompanies && movieMain.productionCompanies.length) {
      movieMain.productionCompanies.forEach((company) => {
        this.productionCompanies.push(this.builder.group(company))
      })
    }

  }

  public addDirector(): void {
    // @todo #643 use no builder : this.get('directors').push(new FieldControl<Director>(director));
    this.directors.push(this.builder.group({ firstName: '', lastName: '' }));
  }

  //@todo #643 factorize with removeProductionCompany
  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

  public addProductionCompany(): void {
    this.productionCompanies.push(this.builder.group({ firstName: ''}));
  }

  public removeProductionCompany(i: number): void {
    this.productionCompanies.removeAt(i);
  }

}