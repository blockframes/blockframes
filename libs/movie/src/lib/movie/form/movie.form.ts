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
  OtherLink,
  MovieExpectedPremiere,
  MovieShootingDate,
  MoviePlannedShootingDateRange,
  MoviePlannedShooting,
  MovieShootingLocations,
  MovieGoalsAudience,
  MovieSalesPitch,
  MovieNote,
  MovieShooting,
  PromotionalVideos,
} from '../+state/movie.firestore';
import {
  Movie,
  Credit,
  createMovie,
  createMovieLegalDocuments,
  createTitle,
  createReleaseYear,
  createStoreConfig,
  createMovieStakeholders,
  createMoviePromotional,
  createMovieLanguageSpecification,
  createOtherLink,
  createShootingPlannedObject,
  createExpectedPremiere,
  createAudienceGoals,
  createSalesPitch,
  createShooting,
  createMovieNote,
} from '../+state/movie.model';
import { FormArray, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { Filmography, createFilmography } from '@blockframes/utils/common-interfaces/identity';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue, FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { yearValidators, urlValidators } from '@blockframes/utils/form/validators/validators';
import { FormValue } from '@blockframes/utils/form';
import { createCredit, Stakeholder, createStakeholder, Director } from '@blockframes/utils/common-interfaces/identity';
import { createMovieAppAccess } from '@blockframes/utils/apps';
import { toDate } from '@blockframes/utils/helpers';
import { Language } from '@blockframes/utils/static-model';
import { FileMetaData } from '@blockframes/media/+state/media.model';

// LEGAL DOCUMENTS

function createLegalDocumentControl(metadata: Partial<FileMetaData>, legalDocument?: Partial<LegalDocument>) {
  const { id, label, media, language, country } = createLegalDocument(legalDocument);
  return {
    id: new FormControl(id),
    label: new FormControl(label),
    media: new HostedMediaForm(media, metadata),
    language: new FormStaticValue<'languages'>(language, 'languages'),
    country: new FormStaticValue<'territories'>(country, 'territories')
  };
}

export type LegalDocumentControl = ReturnType<typeof createLegalDocumentControl>;

export class LegalDocumentForm extends FormEntity<LegalDocumentControl, LegalDocument> {
  constructor(metadata: Partial<FileMetaData>, legalDocument?: Partial<LegalDocument>) {
    super(createLegalDocumentControl(metadata, legalDocument));
  }
}

function createMovieLegalDocumentsControl(movieId: string, legalDocuments?: Partial<MovieLegalDocuments>) {
  const entity = createMovieLegalDocuments(legalDocuments);
  return {
    chainOfTitles: FormList.factory(entity.chainOfTitles, (el, i) => new LegalDocumentForm({ privacy: 'protected', collection: 'movies', docId: movieId ?? '', field: `documents.chainOfTitles[${i}].media` }, el)),
  };
}

export type MovieLegalDocumentsControl = ReturnType<typeof createMovieLegalDocumentsControl>;

export class MovieLegalDocumentsForm extends FormEntity<MovieLegalDocumentsControl, MovieLegalDocuments> {
  constructor(movieId: string, legalDocuments?: Partial<MovieLegalDocuments>) {
    super(createMovieLegalDocumentsControl(movieId, legalDocuments));
  }
}

function createMovieControls(movie: Partial<Movie>) {
  const entity = createMovie(movie);
  return {
    // Sections
    promotional: new MoviePromotionalElementsForm(movie.id, entity.promotional),
    documents: new MovieLegalDocumentsForm(movie.id, entity.documents),

    // Root data
    audience: new AudienceAndGoalsForm(entity.audience),
    banner: new HostedMediaForm(entity.banner, { privacy: 'public', collection: 'movies', docId: entity.id ?? '', field: 'banner' }),
    boxOffice: FormList.factory(entity.boxOffice, el => new BoxOfficeForm(el)),
    cast: FormList.factory(entity.cast, el => new CreditForm(el)),
    certifications: new FormControl(entity.certifications),
    color: new FormControl(entity.color),
    contentType: new FormControl(entity.contentType, [Validators.required]),
    crew: FormList.factory(entity.crew, el => new CreditForm(el)),
    customGenres: FormList.factory(entity.customGenres, el => new FormControl(el)),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el), [Validators.required]),
    // We use FormControl because objet { from, to } is one value (cannot update separately)
    estimatedBudget: new FormControl(entity.estimatedBudget),
    expectedPremiere: new ExpectedPremiereForm(entity.expectedPremiere),
    format: new FormControl(entity.format),
    formatQuality: new FormControl(entity.formatQuality),
    genres: FormList.factory(entity.genres, el => new FormStaticValue(el, 'genres'), [Validators.required]),
    internalRef: new FormControl(entity.internalRef, [Validators.maxLength(30)]),
    keyAssets: new FormControl(entity.keyAssets, [Validators.maxLength(750)]),
    keywords: FormList.factory(entity.keywords, el => new FormControl(el)),
    languages: MovieVersionInfoForm.factory(entity.languages, createLanguageControl),
    logline: new FormControl(entity.logline, [Validators.maxLength(350)]),
    /* If no value is set for this property we want it to be true by default */
    isOriginalVersionAvailable: new FormControl(entity.isOriginalVersionAvailable ?? true),
    originalLanguages: FormList.factory(entity.originalLanguages, el =>
      new FormStaticValue<'languages'>(el, 'languages'), [Validators.required]),
    originalRelease: FormList.factory(entity.originalRelease, el => new OriginalReleaseForm(el)),
    originCountries: FormList.factory(entity.originCountries, el =>
      new FormStaticValue<'territories'>(el, 'territories'), [Validators.required]),
    poster: new HostedMediaForm(entity.poster, { privacy: 'public', collection: 'movies', docId: entity.id ?? '', field: 'poster' }),
    prizes: FormList.factory(entity.prizes, el => new MoviePrizeForm(el)),
    customPrizes: FormList.factory(entity.customPrizes, el => new MoviePrizeForm(el)),
    producers: FormList.factory(entity.producers, el => new CreditForm(el)),
    productionStatus: new FormControl(entity.productionStatus),
    rating: FormList.factory(entity.rating, el => new MovieRatingForm(el)),
    release: new ReleaseYearForm(entity.release),
    review: FormList.factory(entity.review, el => new MovieReviewForm(el)),
    runningTime: new RunningTimeForm(entity.runningTime),
    scoring: new FormControl(entity.scoring),
    shooting: new MovieShootingForm(entity.shooting),
    soundFormat: new FormControl(entity.soundFormat),
    stakeholders: new StakeholderMapForm(entity.stakeholders),
    storeConfig: new StoreConfigForm(entity.storeConfig),
    synopsis: new FormControl(entity.synopsis, [Validators.required, Validators.maxLength(1500)]),
    title: new TitleForm(entity.title),
  }
}

export type MovieControl = ReturnType<typeof createMovieControls>;

export class MovieForm extends FormEntity<MovieControl, Movie> {
  constructor(movie?: Partial<Movie>) {
    super(createMovieControls(movie));
  }

  setAllValue(movie: Partial<Movie> = {}) {
    const controls = createMovieControls(movie);
    for (const key in controls) {
      if (this.contains(key)) {
        const control = this.get(key as keyof MovieControl);
        const value = controls[key].value;
        if (control instanceof FormList) {
          control.patchAllValue(value);
        } else {
          control.patchValue(value);
        }
      } else {
        this.addControl(key, controls[key]);
      }
    }
  }

  get customPrizes() {
    return this.get('customPrizes');
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

  get certifications() {
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

  get isOriginalVersionAvailable() {
    return this.get('isOriginalVersionAvailable');
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

  get internalRef() {
    return this.get('internalRef');
  }

  get customGenres() {
    return this.get('customGenres');
  }

  get contentType() {
    return this.get('contentType');
  }

  get title() {
    return this.get('title');
  }

  get estimatedBudget() {
    return this.get('estimatedBudget');
  }

  get shooting() {
    return this.get('shooting');
  }

  get expectedPremiere() {
    return this.get('expectedPremiere');
  }

  get audience() {
    return this.get('audience');
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
    unit: 'usd',
    value: 0,
    territory: null,
    ...params,
  }
}

// ------------------------------
//         PRIZES
// ------------------------------

function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, premiere } = createPrize(entity);
  return {
    name: new FormControl(name),
    year: new FormControl(year, [yearValidators()]),
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
    firstName: new FormControl(firstName, [Validators.required]),
    lastName: new FormControl(lastName, [Validators.required]),
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

  get filmography() {
    return this.get('filmography');
  }
}

// ------------------------------
//         DIRECTORS
// ------------------------------

export class DirectorForm extends FormEntity<DirectorFormControl> {
  constructor(director?: Partial<Director>) {
    super(createDirectorFormControl(director))
  }

  get filmography() {
    return this.get('filmography');
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
    year: new FormControl(year, [yearValidators()]),
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
    countries: FormList.factory(countries, e => new FormStaticValue<'territories'>(e, 'territories'), Validators.required)
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
  const { original, international, series } = createTitle(title);
  return {
    original: new FormControl(original),
    international: new FormControl(international, Validators.required),
    series: new FormControl(series),
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
    year: new FormControl(year, [yearValidators(), Validators.required]),
    status: new FormControl(status, [Validators.required]),
  }
}

type ReleaseYearFormControl = ReturnType<typeof createReleaseYearFormControl>;

// ------------------------------
//        RUNNING TIME
// ------------------------------

export class RunningTimeForm extends FormEntity<RunningTimeFormControl> {
  constructor(runningTime?: Movie['runningTime'], validators: ValidatorFn[] = []) {
    super(createRunningTimeFormControl(runningTime), [...validators, runningTimeRequired]);
  }
}

function createRunningTimeFormControl(runningTime?: Partial<Movie['runningTime']>) {
  const { time, status, episodeCount } = runningTime;
  return {
    time: new FormControl(time, [Validators.min(1)]),
    status: new FormControl(status),
    episodeCount: new FormControl(episodeCount, [Validators.min(1)])
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

export class OtherLinkForm extends FormEntity<OtherLinkControl> {
  constructor(otherLink?: Partial<OtherLink>) {
    super(createOtherLinkFormControl(otherLink));
  }
}

function createOtherLinkFormControl(otherLink?: Partial<OtherLink>) {
  const { name, url } = createOtherLink(otherLink);
  return {
    name: new FormControl(name, [Validators.required]),
    url: new FormControl(url, [Validators.required, urlValidators]),
  }
}

type OtherLinkControl = ReturnType<typeof createOtherLinkFormControl>;

function createMoviePromotionalElementsControls(movieId: string, promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotional(promotionalElements);
  return {
    // Images
    still_photo: FormList.factory(entity.still_photo, (el, i) => new HostedMediaForm(el, { privacy: 'public', collection: 'movies', docId: movieId ?? '', field: `promotional.still_photo[${i}]` })),

    // Hosted Media
    financialDetails: new FormEntity({
      storagePath: new FormControl(entity.financialDetails.storagePath),
    }),
    presentation_deck: new FormEntity({
      storagePath: new FormControl(entity.presentation_deck.storagePath),
    }),
    scenario: new FormEntity({
      storagePath: new FormControl(entity.scenario.storagePath),
    }),
    moodboard: new FormEntity({
      storagePath: new FormControl(entity.moodboard.storagePath),
    }),
    notes: FormList.factory(entity.notes, el => new FormEntity({
      role: new FormControl(el.role),
      firstName: new FormControl(el.firstName),
      lastName: new FormControl(el.lastName),
      file: new FormEntity({
        storagePath: new FormControl(entity.scenario.storagePath),
      }),
    })),
    salesPitch: new MovieSalesPitchForm(movieId, entity.salesPitch),

    // Hosted Videos
    videos: new MoviePromotionalVideosForm(entity.videos),

    // External Media
    clip_link: new FormControl(entity.clip_link, urlValidators),
    promo_reel_link: new FormControl(entity.promo_reel_link, urlValidators),
    screener_link: new FormControl(entity.screener_link, urlValidators),
    trailer_link: new FormControl(entity.trailer_link, urlValidators),
    teaser_link: new FormControl(entity.teaser_link, urlValidators),
    other_links: FormList.factory<OtherLink>(entity.other_links, el => new OtherLinkForm(el)),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(movieId: string, promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(movieId, promotionalElements));
  }

  get videos() {
    return this.get('videos');
  }
}

// ------------------------------
//              NOTES
// ------------------------------

function createMovieNoteControls(note?: Partial<MovieNote>, metadata?: Partial<FileMetaData>) {
  const entity = createMovieNote(note)
  return {
    role: new FormControl(entity.role),
    firstName: new FormControl(entity.firstName),
    lastName: new FormControl(entity.lastName),
    ref: new HostedMediaForm(entity.ref, metadata)
  }
}

export type MovieNotesControl = ReturnType<typeof createMovieNoteControls>

export class MovieNotesForm extends FormEntity<MovieNotesControl> {
  constructor(note?: Partial<MovieNote>, metadata?: Partial<FileMetaData>) {
    super(createMovieNoteControls(note, metadata));
  }
}

// ------------------------------
//         SALES PITCH
// ------------------------------

function createMovieSalesPitchControl(movieId: string, pitch: Partial<MovieSalesPitch> = {}) {
  const { description, ref } = createSalesPitch(pitch);
  return {
    description: new FormControl(description),
    ref: new HostedMediaForm(ref, { privacy: 'public', collection: 'movies', docId: movieId ?? '', field: 'promotional.salesPitch.ref' }),
  }
}

export type MovieSalesPitchControls = ReturnType<typeof createMovieSalesPitchControl>;

export class MovieSalesPitchForm extends FormEntity<MovieSalesPitchControls, MovieSalesPitch> {
  constructor(movieId: string, review?: Partial<MovieSalesPitch>) {
    super(createMovieSalesPitchControl(movieId, review));
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
    country: new FormStaticValue<'territories'>(country, 'territories'),
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
    country: new FormStaticValue<'territories'>(country, 'territories'),
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
  versionInfo: Partial<{ [language in Language]: MovieLanguageSpecification }>
) {
  const controls = {};
  for (const language in versionInfo) {
    controls[language] = new VersionSpecificationForm(versionInfo[language]);
  }
  return controls;
}

export class MovieVersionInfoForm extends FormEntity<any> {
  constructor(
    versionInfo: Partial<{ [language in Language]: MovieLanguageSpecification }> = {}
  ) {
    super(createLanguageControl(versionInfo));
  }

  addLanguage(language: Language, value?: Partial<MovieLanguageSpecification>) {
    const spec = createMovieLanguageSpecification(value);
    this.setControl(language, new VersionSpecificationForm(spec));
  }

  removeLanguage(language: Language) {
    this.removeControl(language);
    this.updateValueAndValidity();
  }
}

export class VersionSpecificationForm extends FormEntity<any> {
  constructor(versionSpecification: MovieLanguageSpecification, validators: ValidatorFn[] = []) {
    super({
      dubbed: new FormControl(versionSpecification.dubbed),
      subtitle: new FormControl(versionSpecification.subtitle),
      caption: new FormControl(versionSpecification.caption)
    }, [...validators, versionLanguagesValidator]);
  }
}

const versionLanguagesValidator: ValidatorFn = (version: VersionSpecificationForm) => {
  return Object.values(version.value).every(hasVersion => !hasVersion) ? { noVersion: true } : null;
}

// ------------------------------
//        EXPECTED PREMIERE
// ------------------------------

function createExpectedPremiereFormControl(entity?: Partial<MovieExpectedPremiere>) {
  const { event, date } = createExpectedPremiere(entity);
  return {
    date: new FormControl(date),
    event: new FormControl(event),
  }
}

type ExpectedPremiereFormControl = ReturnType<typeof createExpectedPremiereFormControl>;

export class ExpectedPremiereForm extends FormEntity<ExpectedPremiereFormControl> {
  constructor(expectedPremiere?: Partial<MovieExpectedPremiere>) {
    super(createExpectedPremiereFormControl(expectedPremiere));
  }
}

// ---------------------------------
//       SHOOTING INFORMATION
// ---------------------------------

export class MovieShootingForm extends FormEntity<MovieShootingControl> {
  constructor(shooting?: Partial<MovieShooting>) {
    super(createShootingFormControl(shooting));
  }
}

type MovieShootingControl = ReturnType<typeof createShootingFormControl>;

function createShootingFormControl(entity?: Partial<MovieShooting>) {
  const { locations, dates } = createShooting(entity);
  return {
    dates: new ShootingDateForm(dates),
    locations: FormList.factory(locations, el => new ShootingLocationsForm(el)),
  }
}

// ------------------------------
//        SHOOTING DATE
// ------------------------------

function createShootingDateFormControl(entity?: Partial<MovieShootingDate>) {
  const { completed, progress, planned } = createMovieShootingDate(entity);
  return {
    completed: new FormControl(completed),
    progress: new FormControl(progress),
    planned: new ShootingPlannedForm(planned),
  }
}

type ShootingDateFormControl = ReturnType<typeof createShootingDateFormControl>;

export class ShootingDateForm extends FormEntity<ShootingDateFormControl> {
  constructor(shootingDate?: Partial<MovieShootingDate>) {
    super(createShootingDateFormControl(shootingDate));
  }
}

export function createMovieShootingDate(
  params: Partial<MovieShootingDate> = {}
): MovieShootingDate {
  return {
    ...params,
    completed: toDate(params.completed),
    progress: toDate(params.progress)
  };
}

// ---------------------------------
//    SHOOTING DATE PLANNED RANGE
// ---------------------------------

export class ShootingPlannedForm extends FormEntity<ShootingPlannedFormControl> {
  constructor(shootingRange?: Partial<MoviePlannedShootingDateRange>) {
    super(createShootingRangeFormControl(shootingRange));
  }
}

function createShootingRangeFormControl(entity?: Partial<MoviePlannedShootingDateRange>) {
  const { from, to } = createPlannedRange(entity);
  return {
    from: new ShootingPlannedObjectForm(from),
    to: new ShootingPlannedObjectForm(to)
  }
}

type ShootingPlannedFormControl = ReturnType<typeof createShootingRangeFormControl>;

function createPlannedRange(params: Partial<MoviePlannedShootingDateRange> = {}) {
  return {
    from: {},
    to: {},
    ...params
  }
}

// ---------------------------------
//    SHOOTING DATE PLANNED OBJECT
// ---------------------------------

export class ShootingPlannedObjectForm extends FormEntity<MoviePlannedShootingControl> {
  constructor(shootingPlanned?: Partial<MoviePlannedShooting>) {
    super(createShootingPlannedFormControl(shootingPlanned));
  }
}

function createShootingPlannedFormControl(entity: Partial<MoviePlannedShooting> = {}) {
  const { period, month, year } = createShootingPlannedObject(entity);
  return {
    period: new FormControl(period),
    month: new FormControl(month),
    year: new FormControl(year, yearValidators())
  }
}

type MoviePlannedShootingControl = ReturnType<typeof createShootingPlannedFormControl>;

// ---------------------------------
//        SHOOTING LOCATIONS
// ---------------------------------

export class ShootingLocationsForm extends FormEntity<MovieShootingLocationsControl> {
  constructor(shootingLocations?: Partial<MovieShootingLocations>) {
    super(createShootingLocationsFormControl(shootingLocations));
  }
}

function createShootingLocationsFormControl(entity?: Partial<MovieShootingLocations>) {
  const { cities, country } = createShootingLocations(entity);
  return {
    cities: new FormControl(cities),
    country: new FormControl(country)
  }
}

type MovieShootingLocationsControl = ReturnType<typeof createShootingLocationsFormControl>;

function createShootingLocations(params: Partial<MovieShootingLocations>): MovieShootingLocations {
  return {
    cities: [],
    ...params
  }
}

// ---------------------------------
//        AUDIENCE AND GOALS
// ---------------------------------

export class AudienceAndGoalsForm extends FormEntity<MovieAudianceAndGoalsControl> {
  constructor(audience?: Partial<MovieGoalsAudience>) {
    super(createAudianceAndGoalsFormControl(audience));
  }
}

function createAudianceAndGoalsFormControl(entity?: Partial<MovieGoalsAudience>) {
  const { targets, goals } = createAudienceGoals(entity);
  return {
    targets: FormList.factory(targets, el => new FormControl(el)),
    goals: new FormStaticValueArray<'socialGoals'>(goals, 'socialGoals')
  }
}

type MovieAudianceAndGoalsControl = ReturnType<typeof createAudianceAndGoalsFormControl>;


// ------------------------------
//         HOSTED VIDEOS
// ------------------------------

// function createMovieHostedVideoControl(hostedVideo: Partial<HostedVideo> = {}, metadata?: Partial<FileMetaData>) {
//   const { ref, jwPlayerId, title, description, type } = createHostedVideo(hostedVideo);
//   return {
//     ref: new HostedMediaForm(ref, metadata),
//     jwPlayerId: new FormControl(jwPlayerId),
//     title: new FormControl(title),
//     description: new FormControl(description),
//     type: new FormControl(type),
//   }
// }

// export type MovieHostedVideoControls = ReturnType<typeof createMovieHostedVideoControl>;

// export class MovieHostedVideoForm extends FormEntity<MovieHostedVideoControls, HostedVideo> {
//   constructor(video?: Partial<HostedVideo>, metadata?: Partial<FileMetaData>) {
//     super(createMovieHostedVideoControl(video, metadata));
//   }

//   get ref() { return this.get('ref'); }
//   get jwPlayerId() { return this.get('jwPlayerId'); }
//   get title() { return this.get('title'); }
//   get description() { return this.get('description'); }
//   get type() { return this.get('type'); }
// }

function createMovieHostedVideosControl(videos: Partial<PromotionalVideos> = {}) {
  return {
    screener: new FormEntity({
      storagePath: new FormControl(videos?.screener?.storagePath ?? ''),
    }),
    otherVideos: FormList.factory(videos?.otherVideos, otherVideo => new FormEntity({
      storagePath: new FormControl(otherVideo?.storagePath ?? ''),
      title:  new FormControl(otherVideo?.title ?? ''),
      description:  new FormControl(otherVideo?.description ?? ''),
      type:  new FormControl(otherVideo?.type ?? ''),
    })),
  }
}

export type MovieHostedVideosControls = ReturnType<typeof createMovieHostedVideosControl>;

export class MoviePromotionalVideosForm extends FormEntity<MovieHostedVideosControls, PromotionalVideos> {
  constructor(videos?: Partial<PromotionalVideos>) {
    super(createMovieHostedVideosControl(videos));
  }

  get otherVideos() {
    return this.get('otherVideos');
  }

  get screener() {
    return this.get('screener');
  }
}
