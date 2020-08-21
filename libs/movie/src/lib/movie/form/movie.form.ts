import {
  MovieStakeholders,
  MovieLegalDocuments,
  BoxOffice,
  Prize,
  MoviePromotionalElements,
  MovieReview,
  MovieOriginalRelease,
  MovieRating,
  MovieLanguageSpecification,
} from '../+state/movie.firestore';
import {
  Movie,
  Credit,
  createMovie,
  createMovieLegalDocuments,
  createTitle,
  createReleaseYear,
  createStoreConfig,
  createRunningTime,
  createMovieStakeholders,
  createMoviePromotional,
  createMovieLanguageSpecification,
} from '../+state/movie.model';

import { FormArray, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { Filmography, createFilmography } from '@blockframes/utils/common-interfaces/identity';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue, FormStaticArray } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { yearValidators, urlValidators } from '@blockframes/utils/form/validators/validators';
import { PriceForm } from '@blockframes/contract/version/form/price/price.form';
import { FormValue } from '@blockframes/utils/form';
import { createCredit, Stakeholder, createStakeholder, Director } from '@blockframes/utils/common-interfaces/identity';
import { createMovieAppAccess } from '@blockframes/utils/apps';
import { MediaFormList } from '@blockframes/media/form/media-list.form';
import { toDate } from '@blockframes/utils/helpers';
import { LanguagesSlug } from '@blockframes/utils/static-model';

// LEGAL DOCUMENTS

function createLegalDocumentControl(legalDocument?: Partial<LegalDocument>) {
  const { id, label, media, language, country } = createLegalDocument(legalDocument);
  return {
    id: new FormControl(id),
    label: new FormControl(label),
    media: new HostedMediaForm(media),
    language: new FormStaticValue(language, 'LANGUAGES'),
    country: new FormStaticValue(country, 'TERRITORIES')
  };
}

export type LegalDocumentControl = ReturnType<typeof createLegalDocumentControl>;

export class LegalDocumentForm extends FormEntity<LegalDocumentControl, LegalDocument> {
  constructor(legalDocument?: Partial<LegalDocument>) {
    super(createLegalDocumentControl(legalDocument));
  }
}

function createMovieLegalDocumentsControl(legalDocuments?: Partial<MovieLegalDocuments>) {
  const entity = createMovieLegalDocuments(legalDocuments);
  return {
    chainOfTitles: FormList.factory(entity.chainOfTitles, el => new LegalDocumentForm(el)),
  };
}

export type MovieLegalDocumentsControl = ReturnType<typeof createMovieLegalDocumentsControl>;

export class MovieLegalDocumentsForm extends FormEntity<MovieLegalDocumentsControl, MovieLegalDocuments> {
  constructor(legalDocuments?: Partial<MovieLegalDocuments>) {
    super(createMovieLegalDocumentsControl(legalDocuments));
  }
}

function createMovieControls(movie: Partial<Movie>) {
  const entity = createMovie(movie);
  return {
    // Sections
    promotional: new MoviePromotionalElementsForm(entity.promotional),
    documents: new MovieLegalDocumentsForm(entity.documents),

    // Root data
    banner: new HostedMediaForm(entity.banner),
    boxOffice: FormList.factory(entity.boxOffice, el => new BoxOfficeForm(el)),
    cast: FormList.factory(entity.cast, el => new CreditForm(el)),
    certifications: new FormControl(entity.certifications),
    color: new FormControl(entity.color),
    contentType: new FormControl(entity.contentType, [Validators.required]),
    crew: FormList.factory(entity.crew, el => new CreditForm(el)),
    customGenres: FormList.factory(entity.customGenres),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el)),
    // We use FormControl because objet { from, to } is one value (cannot update separately)
    estimatedBudget: new FormControl(entity.estimatedBudget),
    format: new FormControl(entity.format),
    formatQuality: new FormControl(entity.formatQuality),
    genres: FormList.factory(entity.genres, el => new FormStaticValue(el, 'GENRES'), [Validators.required]),
    internalRef: new FormControl(entity.internalRef, [Validators.maxLength(30)]),
    keyAssets: new FormControl(entity.keyAssets, [Validators.maxLength(750)]),
    keywords: FormList.factory(entity.keywords),
    languages: MovieVersionInfoForm.factory(entity.languages, createLanguageControl),
    logline: new FormControl(entity.logline, [Validators.maxLength(350)]),
    isOriginalLanguageAvailable: new FormControl(entity.isOriginalLanguageAvailable),
    originalLanguages: FormList.factory(entity.originalLanguages, el => new FormStaticValue(el, 'LANGUAGES'), [Validators.required]),
    originalRelease: FormList.factory(entity.originalRelease, el => new OriginalReleaseForm(el)),
    originCountries: FormList.factory(entity.originCountries, el => new FormStaticValue(el, 'TERRITORIES'), [Validators.required]),
    poster: new HostedMediaForm(entity.poster),
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el)),
    producers: FormList.factory(entity.producers, el => new CreditForm(el)),
    productionStatus: new FormControl(entity.productionStatus),
    rating: FormList.factory(entity.rating, el => new MovieRatingForm(el)),
    release: new ReleaseYearForm(entity.release),
    review: FormList.factory(entity.review, el => new MovieReviewForm(el)),
    runningTime: new RunningTimeForm(entity.runningTime),
    scoring: new FormControl(entity.scoring),
    soundFormat: new FormControl(entity.soundFormat),
    stakeholders: new StakeholderMapForm(entity.stakeholders),
    storeConfig: new StoreConfigForm(entity.storeConfig),
    synopsis: new FormControl(entity.synopsis, [Validators.required, Validators.maxLength(1500)]),
    title: new TitleForm(entity.title),
    totalBudget: new PriceForm(entity.totalBudget),
  }
}

export type MovieControl = ReturnType<typeof createMovieControls>;

export class MovieForm extends FormEntity<MovieControl, Movie> {
  constructor(movie?: Partial<Movie>) {
    super(createMovieControls(movie));
  }

  get banner() {
    return this.get('banner');
  }

  get promotional() {
    return this.get('promotional');
  }

  get directors() {
    return this.get('directors');
  }

  get keywords() {
    return this.get('keywords');
  }

  get keyAssets() {
    return this.get('keyAssets');
  }

  get cast() {
    return this.get('cast');
  }

  get review() {
    return this.get('review');
  }

  get poster() {
    return this.get('poster');
  }

  get producers() {
    return this.get('producers');
  }

  get productionStatus() {
    return this.get('productionStatus')
  }

  get crew() {
    return this.get('crew');
  }

  get rating() {
    return this.get('rating');
  }

  get qualifications() {
    return this.get('certifications');
  }

  get release() {
    return this.get('release');
  }

  get runningTime() {
    return this.get('runningTime');
  }

  get genres() {
    return this.get('genres');
  }

  get originalRelease() {
    return this.get('originalRelease');
  }

  get originCountries() {
    return this.get('originCountries');
  }

  get originalLanguages() {
    return this.get('originalLanguages');
  }

  get prizes() {
    return this.get('prizes');
  }

  get logline() {
    return this.get('logline');
  }

  get boxOffice() {
    return this.get('boxOffice');
  }

  get stakeholders() {
    return this.get('stakeholders');
  }

  get synopsis() {
    return this.get('synopsis');
  }

  get languages() {
    return this.get('languages');
  }

  public removeDirector(i: number): void {
    this.directors.removeAt(i);
  }

  // PRIZES
  public addPrize(): void {
    const credit = new MoviePrizeForm();
    this.prizes.push(credit);
  }

  public removePrize(i: number): void {
    this.prizes.removeAt(i);
  }

  // CREDITS
  public addCredit(credit?: Partial<Credit>, type: 'cast' | 'crew' | 'producer' = 'cast'): void {
    switch (type) {
      case 'producer':
        const producer = createCredit(credit);
        const producerControl = new CreditForm(producer);
        this.producers.push(producerControl);
        break;
      case 'crew':
        const crew = createCredit(credit);
        const crewControl = new CreditForm(crew);
        this.crew.push(crewControl);
        break;
      case 'cast':
      default:
        const cast = createCredit(credit);
        const castControl = new CreditForm(cast);
        this.cast.push(castControl);
        break;
    }
  }

  public removeCredit(i: number, type: 'cast' | 'crew' | 'producer' = 'cast'): void {
    switch (type) {
      case 'producer':
        this.producers.removeAt(i);
        break;
      case 'crew':
        this.crew.removeAt(i);
        break;
      case 'cast':
      default:
        this.cast.removeAt(i);
        break;
    }
  }

  // RATING
  public addRating(): void {
    const rating = new MovieRatingForm();
    this.rating.push(rating);
  }

  public removeRating(i: number): void {
    this.rating.removeAt(i);
  }

  // ORIGINAL RELEASE
  public getOriginalRelease(i: number) {
    return this.originalRelease.controls[i];
  }

  public addOriginalRelease(): void {
    const orignialRelease = new OriginalReleaseForm();
    this.originalRelease.push(orignialRelease);
  }

  public removeOriginalRelease(i: number): void {
    this.originalRelease.removeAt(i);
  }

  reset(value?: EntityControl<Movie>, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    super.reset(value, options);
    this.clearFormArrays();
  }

  /*
  * Clear controls that are FormArrays because form.reset() only set values to null.
  * For more information @see: https://github.com/angular/angular/issues/31110
  */
  protected clearFormArrays() {
    Object.keys(this.controls).forEach((key: string) => {
      const abstractControl = this.controls[key];
      if (abstractControl instanceof FormArray) {
        abstractControl.clear();
      }
    });
  }
}

// ------------------------------
//         BOX OFFICE
// ------------------------------

function createBoxOfficeFormControl(boxOffice?: Partial<BoxOffice>) {
  const { unit, territory, value } = createBoxOffice(boxOffice);
  return {
    unit: new FormValue(unit),
    territory: new FormControl(territory, Validators.required),
    value: new FormControl(value, [Validators.min(1), Validators.required])
  }
}

export type BoxOfficeFormControl = ReturnType<typeof createBoxOfficeFormControl>;

export class BoxOfficeForm extends FormEntity<BoxOfficeFormControl> {
  constructor(boxOffice?: Partial<BoxOffice>) {
    super(createBoxOfficeFormControl(boxOffice))
  }
}

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'boxoffice_dollar',
    value: 0,
    territory: null,
    ...params,
  }
}

// ------------------------------
//         PRIZES
// ------------------------------

function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, logo, premiere } = createPrize(entity);
  return {
    name: new FormControl(name),
    year: new FormControl(year, [yearValidators]),
    prize: new FormControl(prize, [Validators.maxLength(200)]),
    premiere: new FormControl(premiere),
  }
}

type PrizeFormControl = ReturnType<typeof createPrizeFormControl>;

export class MoviePrizeForm extends FormEntity<PrizeFormControl> {
  constructor(prize?: Partial<Prize>) {
    super(createPrizeFormControl(prize));
  }
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    ...prize
  };
}

// ------------------------------
//          CREDIT
// ------------------------------

function createCreditFormControl(credit?: Partial<Credit>) {
  const { firstName, lastName, role, status, description, filmography } = createCredit(credit);
  return {
    firstName: new FormControl(firstName),
    lastName: new FormControl(lastName),
    role: new FormControl(role),
    filmography: new FormArray([new FilmographyForm(filmography[0]), new FilmographyForm(filmography[1]), new FilmographyForm(filmography[2])]),
    description: new FormControl(description),
    status: new FormControl(status),
  }
}

export type CreditFormControl = ReturnType<typeof createCreditFormControl>;

export class CreditForm extends FormEntity<CreditFormControl> {
  constructor(credit?: Partial<Credit>) {
    super(createCreditFormControl(credit));
  }
}

// ------------------------------
//         DIRECTORS
// ------------------------------

export class DirectorForm extends FormEntity<DirectorFormControl> {
  constructor(director?: Partial<Director>) {
    super(createDirectorFormControl(director))
  }
}

function createDirectorFormControl(director?: Partial<Director>) {
  const { firstName, lastName, filmography, status, description, category } = createCredit(director);
  return {
    firstName: new FormControl(firstName, Validators.required),
    lastName: new FormControl(lastName, Validators.required),
    filmography: new FormArray([new FilmographyForm(filmography[0]), new FilmographyForm(filmography[1]), new FilmographyForm(filmography[2])]),
    description: new FormControl(description),
    status: new FormControl(status),
    category: new FormControl(category)
  }
}

type DirectorFormControl = ReturnType<typeof createDirectorFormControl>;

// ------------------------------
//          FILMOGRAPHY
// ------------------------------

function createFilmographyFormControl(filmography?: Partial<Filmography>) {
  const { year, title } = createFilmography(filmography);
  return {
    year: new FormControl(year, [yearValidators]),
    title: new FormControl(title)
  }
}

export type FilmographyFormControl = ReturnType<typeof createFilmographyFormControl>;

export class FilmographyForm extends FormEntity<FilmographyFormControl> {
  constructor(filmography?: Partial<Filmography>) {
    super(createFilmographyFormControl(filmography));
  }
}

// ------------------------------
//       STAKEHOLDERS
// ------------------------------

export class StakeholderForm extends FormEntity<StakeholderControl, Stakeholder> {
  constructor(stakeholder?: Partial<Stakeholder>) {
    super(createStakeholderControl(stakeholder))
  }
}

function createStakeholderControl(stakeholder?: Partial<Stakeholder>) {
  const { displayName, countries } = createStakeholder(stakeholder);
  return {
    displayName: new FormControl(displayName, Validators.required),
    countries: FormList.factory(countries, e => new FormStaticValue(e, 'TERRITORIES'), Validators.required)
  }
}

type StakeholderControl = ReturnType<typeof createStakeholderControl>;

// ------------------------------
//       STAKEHOLDERS MAP
// ------------------------------

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

// ------------------------------
//         TITLE
// ------------------------------

export class TitleForm extends FormEntity<TitleFormControl> {
  constructor(title?: Movie['title']) {
    super(createTitleFormControl(title));
  }
}

function createTitleFormControl(title?: Partial<Movie['title']>) {
  const { original, international } = createTitle(title);
  return {
    original: new FormControl(original),
    international: new FormControl(international, Validators.required),
  }
}

type TitleFormControl = ReturnType<typeof createTitleFormControl>;

// ------------------------------
//        RELEASE YEAR
// ------------------------------

export class ReleaseYearForm extends FormEntity<ReleaseYearFormControl> {
  constructor(release?: Movie['release']) {
    super(createReleaseYearFormControl(release));
  }
}

function createReleaseYearFormControl(release?: Partial<Movie['release']>) {
  const { year, status } = createReleaseYear(release);
  return {
    year: new FormControl(year, [yearValidators, Validators.required]),
    status: new FormControl(status, [Validators.required]),
  }
}

type ReleaseYearFormControl = ReturnType<typeof createReleaseYearFormControl>;

// ------------------------------
//        RUNNING TIME
// ------------------------------

export class RunningTimeForm extends FormEntity<RunningTimeFormControl> {
  constructor(runningTime?: Movie['runningTime']) {
    super(createRunningTimeFormControl(runningTime), [runningTimeRequired]);
  }
}

function createRunningTimeFormControl(runningTime?: Partial<Movie['runningTime']>) {
  const { time, status } = createRunningTime(runningTime);
  return {
    time: new FormControl(time, [Validators.min(1)]),
    status: new FormControl(status),
  }
}

type RunningTimeFormControl = ReturnType<typeof createRunningTimeFormControl>;

const runningTimeRequired: ValidatorFn = (form: RunningTimeForm) => {
  const time = form.get('time').value;
  const status = form.get('status').value;
  return (status === "confirmed" && !time)
    ? { timeRequired: true }
    : null;
};

// ------------------------------
//       STORE CONFIG
// ------------------------------

export class StoreConfigForm extends FormEntity<StoreConfigControl> {
  constructor(storeConfig?: Partial<Movie['storeConfig']>) {
    super(createStoreConfigFormControl(storeConfig));
  }
}

function createStoreConfigFormControl(storeConfig?: Partial<Movie['storeConfig']>) {
  const { appAccess, status, storeType } = createStoreConfig(storeConfig);
  return {
    appAccess: new AppAccessForm(appAccess),
    status: new FormControl(status),
    storeType: new FormControl(storeType),
  }
}

type StoreConfigControl = ReturnType<typeof createStoreConfigFormControl>;

// ------------------------------
//         APP ACCESS
// ------------------------------

export class AppAccessForm extends FormEntity<AppAccessControl> {
  constructor(appAccess?: Partial<Movie['storeConfig']['appAccess']>) {
    super(createAppAccessFormControl(appAccess));
  }
}

function createAppAccessFormControl(appAccess?: Partial<Movie['storeConfig']['appAccess']>) {
  const { catalog, festival } = createMovieAppAccess(appAccess);
  return {
    catalog: new FormControl(catalog),
    festival: new FormControl(festival)
  }
}

type AppAccessControl = ReturnType<typeof createAppAccessFormControl>;

// ------------------------------
//   Every Promotional Elements
// ------------------------------

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotional(promotionalElements);

  const stillPhotoControls: Record<string, HostedMediaForm> = {};
  for (const key in entity.still_photo) {
    stillPhotoControls[key] = new HostedMediaForm(entity.still_photo[key]);
  }

  return {
    // Images
    still_photo: new MediaFormList<Record<string, HostedMediaForm>>(stillPhotoControls),

    // Hosted Media
    presentation_deck: new HostedMediaForm(entity.presentation_deck),
    scenario: new HostedMediaForm(entity.scenario),
    moodboard: new HostedMediaForm(entity.moodboard),
    notes: new HostedMediaForm(entity.notes),

    // External Media
    clip_link: new FormControl(entity.clip_link),
    promo_reel_link: new FormControl(entity.promo_reel_link),
    screener_link: new FormControl(entity.screener_link),
    trailer_link: new FormControl(entity.trailer_link),
    teaser_link: new FormControl(entity.teaser_link),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }
}

// ------------------------------
//           REVIEWS
// ------------------------------

function createMovieReviewControl(review: Partial<MovieReview> = {}) {
  const { criticName, journalName, criticQuote, revueLink } = createMovieReview(review);
  return {
    criticName: new FormControl(criticName),
    journalName: new FormControl(journalName),
    criticQuote: new FormControl(criticQuote),
    revueLink: new FormControl(revueLink, urlValidators),
  }
}

export type MovieReviewControls = ReturnType<typeof createMovieReviewControl>;

export class MovieReviewForm extends FormEntity<MovieReviewControls, MovieReview> {
  constructor(review?: Partial<MovieReview>) {
    super(createMovieReviewControl(review));
  }
}

export function createMovieReview(params: Partial<MovieReview> = {}): MovieReview {
  return {
    criticName: '',
    journalName: '',
    criticQuote: '',
    revueLink: '',
    ...params,
  }
}

// ------------------------------
//           RATING
// ------------------------------

function createRatingFormControl(entity?: Partial<MovieRating>) {
  const { country, reason, system, value } = createMovieRating(entity);
  return {
    country: new FormStaticValue(country, 'TERRITORIES'),
    reason: new FormControl(reason),
    system: new FormControl(system),
    value: new FormControl(value),
  }
}

type RatingFormControl = ReturnType<typeof createRatingFormControl>;

export class MovieRatingForm extends FormEntity<RatingFormControl> {
  constructor(rating?: Partial<MovieRating>) {
    super(createRatingFormControl(rating));
  }
}

export function createMovieRating(params: Partial<MovieRating> = {}): MovieRating {
  return {
    country: null,
    value: '',
    ...params
  };
}

// ------------------------------
//        ORIGINAL RELEASE
// ------------------------------

function createOriginalReleaseFormControl(entity?: Partial<MovieOriginalRelease>) {
  const { country, date, media } = createMovieOriginalRelease(entity);
  return {
    country: new FormStaticValue(country, 'TERRITORIES'),
    date: new FormControl(date),
    media: new FormControl(media),
  }
}

type OriginalReleaseFormControl = ReturnType<typeof createOriginalReleaseFormControl>;

export class OriginalReleaseForm extends FormEntity<OriginalReleaseFormControl> {
  constructor(originalRelease?: Partial<MovieOriginalRelease>) {
    super(createOriginalReleaseFormControl(originalRelease));
  }
}

export function createMovieOriginalRelease(
  params: Partial<MovieOriginalRelease> = {}
): MovieOriginalRelease {
  return {
    country: null,
    ...params,
    date: toDate(params.date),
  };
}

// ------------------------------
//          LANGUAGES
// ------------------------------

export function createLanguageControl(
  versionInfo: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>
) {
  const controls = {};
  for (const language in versionInfo) {
    controls[language] = new VersionSpecificationForm(versionInfo[language]);
  }
  return controls;
}

export class MovieVersionInfoForm extends FormEntity<any> {
  constructor(
    versionInfo: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }> = {}
  ) {
    super(createLanguageControl(versionInfo));
  }
}

export class VersionSpecificationForm extends FormEntity<any> {
  constructor(versionSpecifictaion: MovieLanguageSpecification) {
    super({
      dubbed: new FormControl(versionSpecifictaion.dubbed),
      subtitle: new FormControl(versionSpecifictaion.subtitle),
      caption: new FormControl(versionSpecifictaion.caption)
    });
  }
}
