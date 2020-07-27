import { FormArray, FormControl, Validators } from '@angular/forms';
import { MoviePromotionalElementsForm, MoviePromotionalHostedMediaForm } from './promotional-elements/promotional-elements.form';
import { Movie, createMovie, createMovieLegalDocuments } from '../+state';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue, FormStaticArray } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { MovieLegalDocuments } from '../+state/movie.firestore';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MovieTechnicalInfoForm } from './techincal-info.form';
import { TitleForm, DirectorForm, StoreConfigForm, StakeholderMapForm } from './main/main.form';
import { yearValidators } from '@blockframes/utils/form/validators/validators';
import { PriceForm } from '@blockframes/contract/version/form/price/price.form';
import { BoxOfficeForm } from './budget/budget.form';
import { MoviePrizeForm } from './festival-prizes/festival-prizes.form';
import { MovieReviewForm } from './review/review.form';
import { CreditForm } from './sales-cast/sales-cast.form';
import { MovieRatingForm, OriginalReleaseForm } from './sales-info/sales-info.form';
import { MovieVersionInfoForm } from './version-info/version-info.form';
import { createLanguageControl } from '@blockframes/movie/form/version-info/version-info.form';

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
    technicalInformation: new MovieTechnicalInfoForm(entity.salesInfo),

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

// @Injectable()
export class MovieForm extends FormEntity<MovieControl, Movie> {
  constructor(movie?: Partial<Movie>) {
    super(createMovieControls(movie));
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
