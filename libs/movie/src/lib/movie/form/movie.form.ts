import { FormArray, FormControl } from '@angular/forms';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { Movie, createMovie, createMovieLegalDocuments } from '../+state';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { MovieLegalDocuments } from '../+state/movie.firestore';
import { FormEntity, EntityControl } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MovieTechnicalInfoForm } from './techincal-info.form';

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
    promotional: new MoviePromotionalElementsForm(entity.promotional),
    documents: new MovieLegalDocumentsForm(entity.documents),
    technicalInformation: new MovieTechnicalInfoForm(entity.salesInfo)
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
