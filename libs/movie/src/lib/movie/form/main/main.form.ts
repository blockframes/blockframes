import { MovieMain, Credit, createMovieMain, Movie, MovieStakeholders, createMovieStakeholders, createTitle, createStoreConfig } from '../../+state';
import { Validators, FormControl } from '@angular/forms';
import { createCredit, Stakeholder, createStakeholder } from '@blockframes/utils/common-interfaces/identity';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormStaticValue, FormStaticArray } from '@blockframes/utils/form/forms/static-value.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { yearValidators } from '@blockframes/utils/form/validators/validators';
import { createMovieAppAccess } from '@blockframes/utils/apps';
import { MoviePromotionalHostedMediaForm } from '../promotional-elements/promotional-elements.form';

// CREDIT

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
  constructor(credit?: Partial<Credit>) {
    super(createCreditFormControl(credit));
  }
}

// DIRECTOR

export class DirectorForm extends FormEntity<DirectorFormControl> {
  constructor(director?: Partial<Credit>) {
    super(createDirectorFormControl(director))
  }
}

function createDirectorFormControl(director?: Partial<Credit>) {
  const { firstName, lastName, filmography } = createCredit(director);
  return {
    firstName: new FormControl(firstName, Validators.required),
    lastName: new FormControl(lastName, Validators.required),
    filmography: new FormControl(filmography)
  }
}

type DirectorFormControl = ReturnType<typeof createDirectorFormControl>;

// STAKEHOLDERS

export class StakeholderForm extends FormEntity<StakeholderControl, Stakeholder> {
  constructor(stakeholder?: Partial<Stakeholder>) {
    super(createStakeholderControl(stakeholder))
  }
}

function createStakeholderControl(stakeholder?: Partial<Stakeholder>) {
  const { displayName, countries } = createStakeholder(stakeholder);
  return {
    displayName: new FormControl(displayName),
    countries: FormList.factory(countries, e => new FormStaticValue(e, 'TERRITORIES'))
  }
}

type StakeholderControl = ReturnType<typeof createStakeholderControl>;


// STAKEHOLDERS MAP
export class StakeholderMapForm extends FormEntity<StakeholderMapControl> {
  constructor(stakeholders?: Partial<MovieStakeholders>) {
    super(createStakeholderMapControl(stakeholders));
  }
}

function createStakeholderMapControl(stakeholders?: Partial<MovieStakeholders>): StakeholderMapControl {
  const entity = createMovieStakeholders(stakeholders);
  const control = {};
  for (const key in entity) {
    control[key] = FormList.factory(entity[key], e => new StakeholderForm(e))
  };
  return control as StakeholderMapControl;
}

type StakeholderMapControl = {
  [key in keyof MovieStakeholders]: FormList<Stakeholder, StakeholderForm>
};


// TITLE

export class TitleForm extends FormEntity<TitleFormControl> {
  constructor(title?: Movie['main']['title']) {
    super(createTitleFormControl(title));
  }
}

function createTitleFormControl(title?: Partial<Movie['main']['title']>) {
  const { original, international } = createTitle(title);
  return {
    original: new FormControl(original),
    international: new FormControl(international, Validators.required),
  }
}

type TitleFormControl = ReturnType<typeof createTitleFormControl>;

// STORE CONFIG

export class StoreConfigForm extends FormEntity<StoreConfigControl> {
  constructor(storeConfig?: Partial<Movie['main']['storeConfig']>) {
    super(createStoreConfigFormControl(storeConfig));
  }
}

function createStoreConfigFormControl(storeConfig?: Partial<Movie['main']['storeConfig']>) {
  const { appAccess, status, storeType } = createStoreConfig(storeConfig);
  return {
    appAccess: new AppAccessForm(appAccess),
    status: new FormControl(status),
    storeType: new FormControl(storeType),
  }
}

type StoreConfigControl = ReturnType<typeof createStoreConfigFormControl>;

// APP ACCESS

export class AppAccessForm extends FormEntity<AppAccessControl> {
  constructor(appAccess?: Partial<Movie['main']['storeConfig']['appAccess']>) {
    super(createAppAccessFormControl(appAccess));
  }
}

function createAppAccessFormControl(appAccess?: Partial<Movie['main']['storeConfig']['appAccess']>) {
  const { catalog, festival } = createMovieAppAccess(appAccess);
  return {
    catalog: new FormControl(catalog),
    festival: new FormControl(festival)
  }
}

type AppAccessControl = ReturnType<typeof createAppAccessFormControl>;

function createMovieMainControls(main : Partial<MovieMain> = {}) {
  const entity = createMovieMain(main);
  return {
    internalRef: new FormControl(entity.internalRef),
    title: new TitleForm(entity.title),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el)),
    releaseYear: new FormControl(entity.releaseYear, [yearValidators]),
    genres: new FormStaticArray(entity.genres, 'GENRES'),
    originCountries: FormList.factory(entity.originCountries, el => new FormStaticValue(el, 'TERRITORIES')),
    originalLanguages: FormList.factory(entity.originalLanguages, el => new FormStaticValue(el, 'LANGUAGES')),
    status: new FormControl(entity.status),
    totalRunTime: new FormControl(entity.totalRunTime, [Validators.min(0)] ),
    contentType: new FormControl(entity.contentType),
    storeConfig: new StoreConfigForm(entity.storeConfig),
    customGenres: FormList.factory(entity.customGenres),
    banner: new MoviePromotionalHostedMediaForm(entity.banner),
    poster: new MoviePromotionalHostedMediaForm(entity.poster),
  }
}

export type MovieMainControl = ReturnType<typeof createMovieMainControls>

export class MovieMainForm extends FormEntity<MovieMainControl>{
  constructor(main: MovieMain) {
    super(createMovieMainControls(main));
  }

  public get genres() {
    return this.get('genres');
  }

  public get customGenres() {
    return this.get('customGenres');
  }

  get originCountries() {
    return this.get('originCountries');
  }

  get originalLanguages() {
    return this.get('originalLanguages');
  }

  get storeConfig() {
    return this.get('storeConfig');
  }

  get title() {
    return this.get('title');
  }

  get directors() {
    return this.get('directors');
  }

  get banner() {
    return this.get('banner');
  }

  get poster() {
    return this.get('poster');
  }

  public addDirector(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new DirectorForm(entity);
    this.directors.push(creditControl);
  }

  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

}
