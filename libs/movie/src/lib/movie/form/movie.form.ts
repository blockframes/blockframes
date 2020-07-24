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
import { TitleForm, DirectorForm, StoreConfigForm } from './main/main.form';
import { yearValidators } from '@blockframes/utils/form/validators/validators';

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
    contentType: new FormControl(entity.contentType),
    customGenres: FormList.factory(entity.customGenres),
    directors: FormList.factory(entity.directors, el => new DirectorForm(el)),
    genres: new FormStaticArray(entity.genres, 'GENRES'),
    internalRef: new FormControl(entity.internalRef),
    originalLanguages: FormList.factory(entity.originalLanguages, el => new FormStaticValue(el, 'LANGUAGES')),
    originCountries: FormList.factory(entity.originCountries, el => new FormStaticValue(el, 'TERRITORIES')),
    poster: new MoviePromotionalHostedMediaForm(entity.poster),
    releaseYear: new FormControl(entity.releaseYear, [yearValidators]),
    status: new FormControl(entity.status),
    storeConfig: new StoreConfigForm(entity.storeConfig),
    title: new TitleForm(entity.title),
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
