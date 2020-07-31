import {
  MovieStakeholders,
  MovieLegalDocuments,
  BoxOffice,
  Prize,
  MoviePromotionalElements,
  PromotionalHostedMedia,
  PromotionalExternalMedia,
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
  createStoreConfig,
  createMovieStakeholders,
  createMoviePromotional,
  createPromotionalExternalMedia,
  createPromotionalHostedMedia,
  createMovieLanguageSpecification,
} from '../+state/movie.model';

import { FormArray, FormControl, Validators } from '@angular/forms';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue, FormStaticArray } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { HostedMediaForm, ExternalMediaForm } from '@blockframes/media/form/media.form';
import { yearValidators, urlValidators } from '@blockframes/utils/form/validators/validators';
import { PriceForm } from '@blockframes/contract/version/form/price/price.form';
import { FormValue } from '@blockframes/utils/form';
import { createCredit, Stakeholder, createStakeholder } from '@blockframes/utils/common-interfaces/identity';
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
    banner: new MoviePromotionalHostedMediaForm(entity.banner),
    boxOffice: FormList.factory(entity.boxOffice, el => new BoxOfficeForm(el)),
    cast: FormList.factory(entity.cast, el => new CreditForm(el)),
    certifications: new FormControl(entity.certifications),
    color: new FormControl(entity.color),
    contentType: new FormControl(entity.contentType),
    crew: FormList.factory(entity.crew, el => new CreditForm(el)),
    customGenres: FormList.factory(entity.customGenres),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el)),
    // We use FormControl because objet { from, to } is one value (cannot update separately)
    estimatedBudget: new FormControl(entity.estimatedBudget),
    format: new FormControl(entity.format),
    formatQuality: new FormControl(entity.formatQuality),
    genres: new FormStaticArray(entity.genres, 'GENRES'),
    internalRef: new FormControl(entity.internalRef),
    keyAssets: new FormControl(entity.keyAssets, [Validators.maxLength(750)]),
    keywords: FormList.factory(entity.keywords),
    languages: MovieVersionInfoForm.factory(entity.languages, createLanguageControl),
    logline:  new FormControl(entity.logline, [Validators.maxLength(180)]),
    originalLanguages: FormList.factory(entity.originalLanguages, el => new FormStaticValue(el, 'LANGUAGES')),
    originalRelease: FormList.factory(entity.originalRelease, el => new OriginalReleaseForm(el)),
    originCountries: FormList.factory(entity.originCountries, el => new FormStaticValue(el, 'TERRITORIES')),
    poster: new MoviePromotionalHostedMediaForm(entity.poster),
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el)),
    producers: FormList.factory(entity.producers, el => new CreditForm(el)),
    productionStatus: new FormControl(entity.productionStatus),
    rating: FormList.factory(entity.rating, el => new MovieRatingForm(el)),
    releaseYear: new FormControl(entity.releaseYear, [yearValidators]),
    review: FormList.factory(entity.review, el => new MovieReviewForm(el)),
    scoring: new FormControl(entity.scoring),
    soundFormat: new FormControl(entity.soundFormat),
    stakeholders: new StakeholderMapForm(entity.stakeholders),
    storeConfig: new StoreConfigForm(entity.storeConfig),
    synopsis: new FormControl(entity.synopsis, [Validators.required, Validators.maxLength(1000)]),
    title: new TitleForm(entity.title),
    totalBudget: new PriceForm(entity.totalBudget),
    totalRunTime: new FormControl(entity.totalRunTime, [Validators.min(0)] ),
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

  get crew() {
    return this.get('crew');
  }

  get rating() {
    return this.get('rating');
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

  // DIRECTORS
  public addDirector(credit?: Partial<Credit>): void {
    const entity = createCredit(credit);
    const creditControl = new DirectorForm(entity);
    this.directors.push(creditControl);
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
    territory: new FormControl(territory),
    value: new FormControl(value, Validators.min(0))
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
    prize: new FormControl(prize),
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
    filmography: new FormControl(filmography),
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
  constructor(director?: Partial<Credit>) {
    super(createDirectorFormControl(director))
  }
}

function createDirectorFormControl(director?: Partial<Credit>) {
  const { firstName, lastName, filmography, status, description } = createCredit(director);
  return {
    firstName: new FormControl(firstName, Validators.required),
    lastName: new FormControl(lastName, Validators.required),
    filmography: new FormControl(filmography),
    description: new FormControl(description),
    status: new FormControl(status),
  }
}

type DirectorFormControl = ReturnType<typeof createDirectorFormControl>;

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
    displayName: new FormControl(displayName),
    countries: FormList.factory(countries, e => new FormStaticValue(e, 'TERRITORIES'))
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
//   Promotional External Media
// ------------------------------

function createPromotionalExternalMediaControl(promotionalExternalMedia?: Partial<PromotionalExternalMedia>) {
  const { label, media } = createPromotionalExternalMedia(promotionalExternalMedia);
  return {
    label: new FormControl(label),
    media: new ExternalMediaForm(media),
  }
}

export type PromotionalExternalMediaControl = ReturnType<typeof createPromotionalExternalMediaControl>;

export class MoviePromotionalExternalMediaForm extends FormEntity<PromotionalExternalMediaControl> {
  constructor(promotionalExternalMedia?: Partial<PromotionalExternalMedia>) {
    super(createPromotionalExternalMediaControl(promotionalExternalMedia));
  }
}

// ------------------------------
//   Promotional Hosted Media
// ------------------------------

function createPromotionalHostedMediaControl(promotionalHostedMedia?: Partial<PromotionalHostedMedia>) {
  const { label, media } = createPromotionalHostedMedia(promotionalHostedMedia);
  return {
    label: new FormControl(label),
    media: new HostedMediaForm(media),
  }
}
export type PromotionalHostedMediaControl = ReturnType<typeof createPromotionalHostedMediaControl>;

export class MoviePromotionalHostedMediaForm extends FormEntity<PromotionalHostedMediaControl> {
  constructor(promotionalHostedMedia?: Partial<PromotionalHostedMedia>) {
    super(createPromotionalHostedMediaControl(promotionalHostedMedia));
  }
}

// ------------------------------
//   Every Promotional Elements
// ------------------------------

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotional(promotionalElements);

  const stillPhotoControls: Record<string, MoviePromotionalHostedMediaForm> = {};
  for (const key in entity.still_photo) {
    stillPhotoControls[key] = new MoviePromotionalHostedMediaForm(entity.still_photo[key]);
  }

  return {
    // Images
    still_photo: new MediaFormList<Record<string, MoviePromotionalHostedMediaForm>>(stillPhotoControls),

    // Hosted Media
    presentation_deck: new MoviePromotionalHostedMediaForm(entity.presentation_deck),
    scenario: new MoviePromotionalHostedMediaForm(entity.scenario),

    // External Media
    promo_reel_link: new MoviePromotionalExternalMediaForm(entity.promo_reel_link),
    screener_link: new MoviePromotionalExternalMediaForm(entity.screener_link),
    trailer_link: new MoviePromotionalExternalMediaForm(entity.trailer_link),
    teaser_link: new MoviePromotionalExternalMediaForm(entity.teaser_link),
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

  addLanguage(language: LanguagesSlug, value?: Partial<MovieLanguageSpecification>) {
    const spec = createMovieLanguageSpecification(value);
    this.setControl(language, new VersionSpecificationForm(spec));
  }

  removeLanguage(language: LanguagesSlug) {
    this.removeControl(language);
    this.updateValueAndValidity();
  }
}

export class VersionSpecificationForm extends FormEntity<any> {
  constructor(versionSpecifictaion: MovieLanguageSpecification) {
    super({
      original: new FormControl(versionSpecifictaion.original),
      dubbed: new FormControl(versionSpecifictaion.dubbed),
      subtitle: new FormControl(versionSpecifictaion.subtitle),
      caption: new FormControl(versionSpecifictaion.caption)
    });
  }
}
