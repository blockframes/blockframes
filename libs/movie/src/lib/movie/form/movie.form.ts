import {
  MovieStakeholders,
  BoxOffice,
  Prize,
  MoviePromotionalElements,
  MovieReview,
  MovieOriginalRelease,
  MovieRating,
  MovieLanguageSpecification,
  MovieExpectedPremiere,
  MovieShootingDate,
  MoviePlannedShootingDateRange,
  MoviePlannedShooting,
  MovieShootingLocations,
  MovieGoalsAudience,
  MovieNote,
  MovieShooting,
  MovieVideos,
  MovieVideo,
  MovieAppConfig,
  LanguageRecord,
  Movie,
  Credit,
  createMovie,
  createTitle,
  createReleaseYear,
  createAppConfig,
  createMovieStakeholders,
  createMoviePromotional,
  createShootingPlannedObject,
  createExpectedPremiere,
  createAudienceGoals,
  createShooting,
  createMovieVideos,
  createMovieNote,
  Filmography,
  createFilmography,
  createDirector,
  createCredit,
  Stakeholder,
  createStakeholder,
  Director,
  createStorageFile,
  App,
  Privacy
} from '@blockframes/model';
import { UntypedFormArray, UntypedFormControl, Validators, ValidatorFn } from '@angular/forms';
import {
  FormStaticValue,
  FormStaticValueArray,
} from '@blockframes/utils/form/forms/static-value.form';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { yearValidators, urlValidators } from '@blockframes/utils/form/validators/validators';
import { FormValue } from '@blockframes/utils/form';

function createMovieControls(movie: Partial<Movie>) {
  const entity = createMovie(movie);
  return {
    // Sections
    promotional: new MoviePromotionalElementsForm(entity.promotional),

    // Root data
    audience: new AudienceAndGoalsForm(entity.audience),
    banner: new StorageFileForm(entity.banner),
    boxOffice: FormList.factory(entity.boxOffice, (el) => new BoxOfficeForm(el)),
    cast: FormList.factory(entity.cast, (el) => new CreditForm(el)),
    certifications: new UntypedFormControl(entity.certifications),
    color: new UntypedFormControl(entity.color),
    contentType: new UntypedFormControl(entity.contentType, [Validators.required]),
    crew: FormList.factory(entity.crew, (el) => new CreditForm(el)),
    customGenres: FormList.factory(entity.customGenres, (el) => new UntypedFormControl(el)),
    directors: FormList.factory(entity.directors, (el) => new DirectorForm(el), [
      Validators.required,
    ]),
    // We use FormControl because objet { from, to } is one value (cannot update separately)
    estimatedBudget: new UntypedFormControl(entity.estimatedBudget),
    expectedPremiere: new ExpectedPremiereForm(entity.expectedPremiere),
    format: new UntypedFormControl(entity.format),
    formatQuality: new UntypedFormControl(entity.formatQuality),
    genres: FormList.factory(entity.genres, (el) => new FormStaticValue(el, 'genres'), [
      Validators.required,
    ]),
    internalRef: new UntypedFormControl(entity.internalRef, [Validators.maxLength(30)]),
    keyAssets: new UntypedFormControl(entity.keyAssets, [Validators.maxLength(1500)]),
    keywords: FormList.factory(entity.keywords, (el) => new UntypedFormControl(el)),
    languages: MovieVersionInfoForm.factory(entity.languages, createLanguageControl),
    logline: new UntypedFormControl(entity.logline, [Validators.maxLength(350)]),
    /* If no value is set for this property we want it to be true by default */
    isOriginalVersionAvailable: new UntypedFormControl(entity.isOriginalVersionAvailable ?? true),
    originalLanguages: FormList.factory(
      entity.originalLanguages,
      (el) => new FormStaticValue<'languages'>(el, 'languages'),
      [Validators.required]
    ),
    originalRelease: FormList.factory(entity.originalRelease, (el) => new OriginalReleaseForm(el)),
    originCountries: FormList.factory(
      entity.originCountries,
      (el) => new FormStaticValue<'territories'>(el, 'territories'),
      [Validators.required]
    ),
    poster: new StorageFileForm(entity.poster),
    prizes: FormList.factory(entity.prizes, (el) => new MoviePrizeForm(el)),
    customPrizes: FormList.factory(entity.customPrizes, (el) => new MoviePrizeForm(el)),
    producers: FormList.factory(entity.producers, (el) => new CreditForm(el)),
    productionStatus: new UntypedFormControl(entity.productionStatus, [Validators.required]),
    rating: FormList.factory(entity.rating, (el) => new MovieRatingForm(el)),
    release: new ReleaseYearForm(entity.release),
    review: FormList.factory(entity.review, (el) => new MovieReviewForm(el)),
    runningTime: new RunningTimeForm(entity.runningTime),
    scoring: new UntypedFormControl(entity.scoring),
    shooting: new MovieShootingForm(entity.shooting),
    soundFormat: new UntypedFormControl(entity.soundFormat),
    stakeholders: new StakeholderMapForm(entity.stakeholders),
    app: new MovieAppConfigForm(entity.app),
    synopsis: new UntypedFormControl(entity.synopsis, [Validators.required, Validators.maxLength(1500)]),
    title: new TitleForm(entity.title),
    delivery: new MovieDeliveryForm(entity.delivery),
  };
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
    return this.get('productionStatus');
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

  reset(
    value?: EntityControl<Movie>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void {
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
      if (abstractControl instanceof UntypedFormArray) {
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
    territory: new UntypedFormControl(territory, Validators.required),
    value: new UntypedFormControl(value, [Validators.min(1), Validators.required]),
  };
}

export type BoxOfficeFormControl = ReturnType<typeof createBoxOfficeFormControl>;

export class BoxOfficeForm extends FormEntity<BoxOfficeFormControl> {
  constructor(boxOffice?: Partial<BoxOffice>) {
    super(createBoxOfficeFormControl(boxOffice));
  }
}

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'usd',
    value: 0,
    territory: null,
    ...params,
  };
}

// ------------------------------
//         PRIZES
// ------------------------------

function createPrizeFormControl(entity?: Partial<Prize>) {
  const { name, year, prize, premiere } = createPrize(entity);
  return {
    name: new UntypedFormControl(name, [Validators.required]),
    year: new UntypedFormControl(year, [yearValidators()]),
    prize: new UntypedFormControl(prize, [Validators.maxLength(200)]),
    premiere: new UntypedFormControl(premiere),
  };
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
    ...prize,
  };
}

// ------------------------------
//          CREDIT
// ------------------------------

function createCreditFormControl(credit?: Partial<Credit>) {
  const { firstName, lastName, role, status, description, filmography } = createCredit(credit);
  return {
    firstName: new UntypedFormControl(firstName, [Validators.required]),
    lastName: new UntypedFormControl(lastName, [Validators.required]),
    role: new UntypedFormControl(role),
    filmography: new UntypedFormArray([
      new FilmographyForm(filmography[0]),
      new FilmographyForm(filmography[1]),
      new FilmographyForm(filmography[2]),
    ]),
    description: new UntypedFormControl(description, Validators.maxLength(500)),
    status: new UntypedFormControl(status),
  };
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
    super(createDirectorFormControl(director));
  }

  get filmography() {
    return this.get('filmography');
  }
}

function createDirectorFormControl(director?: Partial<Director>) {
  const { firstName, lastName, filmography, status, description, category } = createDirector(director);
  return {
    firstName: new UntypedFormControl(firstName, Validators.required),
    lastName: new UntypedFormControl(lastName, Validators.required),
    filmography: new UntypedFormArray([
      new FilmographyForm(filmography[0]),
      new FilmographyForm(filmography[1]),
      new FilmographyForm(filmography[2]),
    ]),
    description: new UntypedFormControl(description, Validators.maxLength(500)),
    status: new UntypedFormControl(status),
    category: new UntypedFormControl(category),
  };
}

type DirectorFormControl = ReturnType<typeof createDirectorFormControl>;

// ------------------------------
//          FILMOGRAPHY
// ------------------------------

function createFilmographyFormControl(filmography?: Partial<Filmography>) {
  const { year, title } = createFilmography(filmography);
  return {
    year: new UntypedFormControl(year, [yearValidators()]),
    title: new UntypedFormControl(title),
  };
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
    super(createStakeholderControl(stakeholder));
  }
}

function createStakeholderControl(stakeholder?: Partial<Stakeholder>) {
  const { displayName, countries } = createStakeholder(stakeholder);
  return {
    displayName: new UntypedFormControl(displayName, Validators.required),
    countries: FormList.factory(
      countries,
      (e) => new FormStaticValue<'territories'>(e, 'territories'),
      Validators.required
    ),
  };
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

function createStakeholderMapControl(
  stakeholders?: Partial<MovieStakeholders>
): StakeholderMapControl {
  const entity = createMovieStakeholders(stakeholders);
  const control = {};
  for (const key in entity) {
    control[key] = FormList.factory(entity[key], (e) => new StakeholderForm(e));
  }
  return control as StakeholderMapControl;
}

type StakeholderMapControl = {
  [key in keyof MovieStakeholders]: FormList<Stakeholder, StakeholderForm>;
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
    original: new UntypedFormControl(original),
    international: new UntypedFormControl(international, Validators.required),
    series: new UntypedFormControl(series, [Validators.max(100), Validators.min(1)]),
  };
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
    year: new UntypedFormControl(year, [yearValidators(), Validators.required]),
    status: new UntypedFormControl(status, [Validators.required]),
  };
}

type ReleaseYearFormControl = ReturnType<typeof createReleaseYearFormControl>;

// ------------------------------
//        RUNNING TIME
// ------------------------------

export class RunningTimeForm extends FormEntity<RunningTimeFormControl> {
  constructor(runningTime?: Movie['runningTime'], validators: ValidatorFn[] = []) {
    super(createRunningTimeFormControl(runningTime), [...validators]);
  }
}

function createRunningTimeFormControl(runningTime?: Partial<Movie['runningTime']>) {
  const { time, status, episodeCount } = runningTime;
  return {
    time: new UntypedFormControl(time, [Validators.min(1)]),
    status: new UntypedFormControl(status),
    episodeCount: new UntypedFormControl(episodeCount, [Validators.max(1000)]),
  };
}

type RunningTimeFormControl = ReturnType<typeof createRunningTimeFormControl>;

// ------------------------------
//       MOVIE APP CONFIG
// ------------------------------

export class MovieAppConfigForm extends FormEntity<MovieAppConfigControl> {
  constructor(app?: Partial<{ [app in App]: MovieAppConfig }>) {
    super(createMovieAppConfigFormControl(app));
  }
}

function createMovieAppConfigFormControl(app?: Partial<{ [app in App]: MovieAppConfig }>) {
  const apps = {};
  for (const a in app) {
    apps[a] = new AppConfigForm(app[a]);
  }
  return apps;
}

type MovieAppConfigControl = ReturnType<typeof createMovieAppConfigFormControl>;

// ------------------------------
//         APP CONFIG
// ------------------------------

export class AppConfigForm extends FormEntity<AppConfigControl> {
  constructor(appAccess?: Partial<MovieAppConfig>) {
    super(createAppConfigFormControl(appAccess));
  }
}

function createAppConfigFormControl(appAccess?: Partial<MovieAppConfig>) {
  const { acceptedAt, submittedAt, access, refusedAt, status } = createAppConfig(appAccess);
  return {
    acceptedAt: new UntypedFormControl(acceptedAt),
    submittedAt: new UntypedFormControl(submittedAt),
    access: new UntypedFormControl(access),
    refusedAt: new UntypedFormControl(refusedAt),
    status: new UntypedFormControl(status),
  };
}

type AppConfigControl = ReturnType<typeof createAppConfigFormControl>;

// ------------------------------
//   Every Promotional Elements
// ------------------------------

function createMoviePromotionalElementsControls(
  promotionalElements?: Partial<MoviePromotionalElements>
) {
  const entity = createMoviePromotional(promotionalElements);
  return {
    // Images
    still_photo: FormList.factory(entity.still_photo, (el) => new StorageFileForm(el)),

    // Hosted Media
    presentation_deck: new StorageFileForm(entity.presentation_deck),
    scenario: new StorageFileForm(entity.scenario),
    moodboard: new StorageFileForm(entity.moodboard),
    notes: FormList.factory(entity.notes, (el) => new MovieNoteForm(el)),

    // Hosted Videos
    videos: new MovieVideosForm(entity.videos),
  };
}

export type MoviePromotionalElementsControl = ReturnType<
  typeof createMoviePromotionalElementsControls
>;

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl> {
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }

  get videos() {
    return this.get('videos');
  }
}

// ------------------------------
//              NOTES
// ------------------------------

function createMovieNoteControls(note?: Partial<MovieNote>) {
  const entity = createStorageFile(note);
  return {
    role: new UntypedFormControl(entity.role),
    firstName: new UntypedFormControl(entity.firstName),
    lastName: new UntypedFormControl(entity.lastName),
    storagePath: new UntypedFormControl(entity.storagePath),
  };
}

export type MovieNotesControl = ReturnType<typeof createMovieNoteControls>;

export class MovieNotesForm extends FormEntity<MovieNotesControl> {
  constructor(note?: Partial<MovieNote>) {
    super(createMovieNoteControls(note));
  }
}

// ------------------------------
//           REVIEWS
// ------------------------------

function createMovieReviewControl(review: Partial<MovieReview> = {}) {
  const { criticName, journalName, criticQuote, revueLink } = createMovieReview(review);
  return {
    criticName: new UntypedFormControl(criticName),
    journalName: new UntypedFormControl(journalName, [Validators.required]),
    criticQuote: new UntypedFormControl(criticQuote, Validators.maxLength(500)),
    revueLink: new UntypedFormControl(revueLink, urlValidators),
  };
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
  };
}

// ------------------------------
//           RATING
// ------------------------------

function createRatingFormControl(entity?: Partial<MovieRating>) {
  const { country, reason, system, value } = createMovieRating(entity);
  return {
    country: new FormStaticValue<'territories'>(country, 'territories'),
    reason: new UntypedFormControl(reason),
    system: new UntypedFormControl(system),
    value: new UntypedFormControl(value),
  };
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
    ...params,
  };
}

// ------------------------------
//        ORIGINAL RELEASE
// ------------------------------

function createOriginalReleaseFormControl(entity?: Partial<MovieOriginalRelease>) {
  const { country, date, media } = createMovieOriginalRelease(entity);
  return {
    country: new FormStaticValue<'territories'>(country, 'territories'),
    date: new UntypedFormControl(date),
    media: new UntypedFormControl(media),
  };
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
    date: params.date,
  };
}

// ------------------------------
//          LANGUAGES
// ------------------------------

export function createLanguageControl(versionInfo: LanguageRecord) {
  const controls = {};
  for (const language in versionInfo) {
    controls[language] = new VersionSpecificationForm(versionInfo[language]);
  }
  return controls;
}

export class MovieVersionInfoForm extends FormEntity<any> {
  constructor(versionInfo: LanguageRecord = {}) {
    super(createLanguageControl(versionInfo));
  }
}

export class VersionSpecificationForm extends FormEntity<any> {
  constructor(versionSpecification: MovieLanguageSpecification, validators: ValidatorFn[] = []) {
    super(
      {
        dubbed: new UntypedFormControl(versionSpecification.dubbed),
        subtitle: new UntypedFormControl(versionSpecification.subtitle),
        caption: new UntypedFormControl(versionSpecification.caption),
      },
      [...validators, versionLanguagesValidator]
    );
  }
}

const versionLanguagesValidator: ValidatorFn = (version: VersionSpecificationForm) => {
  return Object.values(version.value).every((hasVersion) => !hasVersion)
    ? { noVersion: true }
    : null;
};

// ------------------------------
//        EXPECTED PREMIERE
// ------------------------------

function createExpectedPremiereFormControl(entity?: Partial<MovieExpectedPremiere>) {
  const { event, date } = createExpectedPremiere(entity);
  return {
    date: new UntypedFormControl(date),
    event: new UntypedFormControl(event),
  };
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
    locations: FormList.factory(locations, (el) => new ShootingLocationsForm(el)),
  };
}

// ------------------------------
//        SHOOTING DATE
// ------------------------------

function createShootingDateFormControl(entity?: Partial<MovieShootingDate>) {
  const { completed, progress, planned } = entity;
  return {
    completed: new UntypedFormControl(completed),
    progress: new UntypedFormControl(progress),
    planned: new ShootingPlannedForm(planned),
  };
}

type ShootingDateFormControl = ReturnType<typeof createShootingDateFormControl>;

export class ShootingDateForm extends FormEntity<ShootingDateFormControl> {
  constructor(shootingDate?: Partial<MovieShootingDate>) {
    super(createShootingDateFormControl(shootingDate));
  }
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
    to: new ShootingPlannedObjectForm(to),
  };
}

type ShootingPlannedFormControl = ReturnType<typeof createShootingRangeFormControl>;

function createPlannedRange(params: Partial<MoviePlannedShootingDateRange> = {}) {
  return {
    from: {},
    to: {},
    ...params,
  };
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
    period: new UntypedFormControl(period),
    month: new UntypedFormControl(month),
    year: new UntypedFormControl(year, yearValidators()),
  };
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
    cities: new UntypedFormControl(cities),
    country: new UntypedFormControl(country),
  };
}

type MovieShootingLocationsControl = ReturnType<typeof createShootingLocationsFormControl>;

function createShootingLocations(params: Partial<MovieShootingLocations>): MovieShootingLocations {
  return {
    cities: [],
    ...params,
  };
}

// ---------------------------------
//        AUDIENCE AND GOALS
// ---------------------------------

export class AudienceAndGoalsForm extends FormEntity<MovieAudienceAndGoalsControl> {
  constructor(audience?: Partial<MovieGoalsAudience>) {
    super(createAudienceAndGoalsFormControl(audience));
  }
}

function createAudienceAndGoalsFormControl(entity?: Partial<MovieGoalsAudience>) {
  const { targets, goals } = createAudienceGoals(entity);
  return {
    targets: FormList.factory(
      targets.filter((t) => !!t),
      (el) => new UntypedFormControl(el)
    ),
    goals: new FormStaticValueArray<'socialGoals'>(goals.filter((g) => !!g) ?? [], 'socialGoals'),
  };
}

type MovieAudienceAndGoalsControl = ReturnType<typeof createAudienceAndGoalsFormControl>;

// ------------------------------
//         HOSTED VIDEOS
// ------------------------------

function createMovieVideoControl(movieVideo: Partial<MovieVideo> = {}) {
  const file = createStorageFile(movieVideo);
  return {
    privacy: new UntypedFormControl(file.privacy),
    collection: new UntypedFormControl(file.collection),
    docId: new UntypedFormControl(file.docId),
    field: new UntypedFormControl(file.field),
    storagePath: new UntypedFormControl(file.storagePath),
    title: new UntypedFormControl(movieVideo?.title ?? ''),
    description: new UntypedFormControl(movieVideo?.description ?? '', Validators.maxLength(1500)),
    type: new UntypedFormControl(movieVideo?.type ?? ''),
    jwPlayerId: new UntypedFormControl(movieVideo?.jwPlayerId ?? ''),
  };
}

export type MovieVideoControls = ReturnType<typeof createMovieVideoControl>;

export class MovieVideoForm extends FormEntity<MovieVideoControls, MovieVideo> {
  constructor(video?: Partial<MovieVideo>) {
    super(createMovieVideoControl(video));
  }

  get storagePath() {
    return this.get('storagePath');
  }
  get title() {
    return this.get('title');
  }
  get description() {
    return this.get('description');
  }
  get type() {
    return this.get('type');
  }

  get isPublic(): boolean {
    return this.get('privacy').value === 'public';
  }

  togglePrivacy(isPublic: boolean) {
    const privacy: Privacy = isPublic ? 'public' : 'protected';
    this.get('privacy').setValue(privacy);
  }
}

function createMovieVideosControl(videos: Partial<MovieVideos> = {}) {
  const { screener, publicScreener, salesPitch, otherVideo } = createMovieVideos(videos);
  return {
    screener: new MovieVideoForm(screener),
    publicScreener: new MovieVideoForm(publicScreener),
    salesPitch: new MovieVideoForm(salesPitch),
    otherVideo: new MovieVideoForm(otherVideo),
  };
}

export type MovieVideosControls = ReturnType<typeof createMovieVideosControl>;

export class MovieVideosForm extends FormEntity<MovieVideosControls, MovieVideos> {
  constructor(videos?: Partial<MovieVideos>) {
    super(createMovieVideosControl(videos));
  }

  get otherVideo() {
    return this.get('otherVideo');
  }

  get screener() {
    return this.get('screener');
  }

  get publicScreener() {
    return this.get('publicScreener');
  }

  get salesPitch() {
    return this.get('salesPitch');
  }
}

// ---------------------------------
//        MOVIE NOTES
// ---------------------------------

export class MovieNoteForm extends FormEntity<MovieNoteControl> {
  constructor(note?: Partial<MovieNote>) {
    super(createMovieNoteFormControl(note));
  }
}

function createMovieNoteFormControl(entity?: Partial<MovieNote>) {
  const note = createMovieNote(entity);
  return {
    firstName: new UntypedFormControl(note.firstName),
    lastName: new UntypedFormControl(note.lastName),
    role: new UntypedFormControl(note.role),

    privacy: new UntypedFormControl(note.privacy),
    collection: new UntypedFormControl(note.collection),
    docId: new UntypedFormControl(note.docId),
    field: new UntypedFormControl(note.field),
    storagePath: new UntypedFormControl(note.storagePath),
  };
}

type MovieNoteControl = ReturnType<typeof createMovieNoteFormControl>;

// ---------------------------------
//        MOVIE DELIVERY
// ---------------------------------

class MovieDeliveryForm extends FormEntity<MovieDeliveryControl> {
  constructor(delivery: Partial<Movie['delivery']> = {}) {
    super(createMovieDeliveryControls(delivery));
  }
}

function createMovieDeliveryControls(delivery: Partial<Movie['delivery']>) {
  const file = new StorageFileForm(delivery.file);
  return {
    file,
  };
}

type MovieDeliveryControl = ReturnType<typeof createMovieDeliveryControls>;
