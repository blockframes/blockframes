import { FormEntity, FormList, yearValidators } from '@blockframes/utils';
import { MovieMain, Credit, createMovieMain, Movie, createTitle } from '../../+state';
import { Validators, FormControl } from '@angular/forms';
import { createCredit, createCompany } from '@blockframes/utils/common-interfaces/identity';
import { StoreConfig } from '../../+state/movie.firestore';
import { createStoreConfig } from '../../+state/movie.model';


//////////////
// Credit form
//////////////
function createCreditFormControl(credit?: Partial<Credit>) {
  const { firstName, lastName, role } = createCredit(credit);
  return {
    firstName: new FormControl(firstName),
    lastName: new FormControl(lastName),
    role: new FormControl(role),
  }
}

export type CreditFormControl = ReturnType<typeof createCreditFormControl>;

export class MovieCreditForm extends FormEntity<CreditFormControl> {
  constructor(credit?: Credit) {
    super(createCreditFormControl(credit));
  }
}

/////////////////////
/// Store config form
/////////////////////
function createStoreConfigControl(storeConfig?: Partial<StoreConfig>) {
  const { display, storeType } = createStoreConfig(storeConfig);
  return {
    display: new FormControl(display),
    storeType: new FormControl(storeType),
  };
}

export type StoreConfigControl = ReturnType<typeof createStoreConfigControl>;

export class StoreConfigForm extends FormEntity<StoreConfigControl> {
  constructor(storeConfig?: StoreConfig) {
    super(createStoreConfigControl(storeConfig));
  }
}

/////////////
// Title form
/////////////
function createTitleFormControl(title?: Partial<Movie['main']['title']>) {
  const { original, international } = createTitle(title);
  return {
    original: new FormControl(original),
    international: new FormControl(international),
  }
}

type TitleFormControl = ReturnType<typeof createTitleFormControl>;

export class TitleForm extends FormEntity<TitleFormControl> {
  constructor(title?: Movie['main']['title']) {
    super(createTitleFormControl(title));
  }
}

////////////////
// Director form
////////////////
function createDirectorFormControl(director?: Partial<Credit>) {
  const { firstName, lastName, shortBiography } = createCredit(director);
  return {
    firstName: new FormControl(firstName),
    lastName: new FormControl(lastName),
    shortBiography: new FormControl(shortBiography),
  }
}

type DirectorFormControl = ReturnType<typeof createDirectorFormControl>;

export class StakeholdersForm extends FormEntity<StakeholdersControl> {
  constructor(stakeholder?: Partial<Stakeholder>) {
    super(createStakeholdersControl(stakeholder))
  }
}

function createStakeholdersControl(stakeholder?: Partial<Stakeholder>) {
  const { displayName } = createStakeholder(stakeholder);
  return {
    displayName: new FormControl(displayName),
  }
}

type StakeholdersControl = ReturnType<typeof createStakeholdersControl>;

export class ProductionCompagnyForm extends FormEntity<ProductionCompagnyControl> {
  constructor(compagny?: Partial<Credit>) {
    super(createProductionCompagnyControl(compagny))
  }
}

///////////////
// Create movie
///////////////
function createMovieMainControls(main : Partial<MovieMain> = {}) {
  const entity = createMovieMain(main);
  return {
    internalRef: new FormControl(entity.internalRef),
    isan: new FormControl(entity.isan),
    title: new TitleForm(entity.title),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el)),
    poster: new FormControl(entity.poster),
    productionYear: new FormControl(entity.productionYear, yearValidators),
    genres: new FormControl(entity.genres),
    originCountries: FormList.factory(entity.originCountries, el => new FormControl(el)),
    originalLanguages: new FormControl(entity.originalLanguages),
    status: new FormControl(entity.status , [Validators.required]),
    totalRunTime: new FormControl(entity.totalRunTime),
    shortSynopsis: new FormControl(entity.shortSynopsis, [Validators.maxLength(500)] ),
    stakeholders: FormList.factory(entity.stakeholders, el => new StakeholdersForm(el)),
    customGenres: new FormControl(entity.customGenres),
    workType: new FormControl(entity.workType),
    storeConfig: new StoreConfigForm(entity.storeConfig)
  }
}

export type MovieMainControl = ReturnType<typeof createMovieMainControls>

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

  get stakeholders() {
    return this.get('stakeholders');
  }

  get shortSynopsis() {
    return this.get('shortSynopsis');
  }

  get originCountries() {
    return this.get('originCountries');
  }

  get genres() {
    return this.get('genres');
  }

  public addDirector(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new DirectorForm(entity);
    this.directors.push(creditControl);
  }

  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

  public addOriginCountry(country?: string): void {
    const originCountryControl = new FormControl(country);
    this.originCountries.push(originCountryControl);
  }

  // public addGenres(genre?: string): void {
  //   const genreCtrl = new FormControl(genre);
  //   this.genres.push(genreCtrl);
  // }

  public addProductionCompany(): void {
    const credit = new ProductionCompagnyForm();
    this.productionCompanies.push(credit);
  }

  public removeStakeholder(i: number): void {
    this.stakeholders.removeAt(i);
  }
}
