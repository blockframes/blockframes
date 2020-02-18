import { EntityControl, FormEntity, FormList, urlValidators } from '@blockframes/utils';
import { FormArray, FormControl } from '@angular/forms';
import { MovieMainForm } from './main/main.form';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { MoviePromotionalDescriptionForm } from './promotional-description/promotional-description.form';
import { MovieStoryForm } from './story/story.form';
import { MovieSalesCastForm } from './sales-cast/sales-cast.form';
import { Movie, createMovie, createMovieLegalDocuments } from '../+state';
import { MovieSalesInfoForm } from './sales-info/sales-info.form';
import { MovieVersionInfoForm } from './version-info/version-info.form';
import { MovieFestivalPrizesForm } from './festival-prizes/festival-prizes.form';
import { MovieSalesAgentDealForm } from './sales-agent-deal/sales-agent-deal.form';
import { MovieReviewForm } from './review/review.form';
import { MovieBudgetForm } from './budget/budget.form';
import { Injectable } from '@angular/core';
import { LegalDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { FormStaticValue } from '@blockframes/utils/form/forms/static-value.form';
import { createLegalDocument } from '@blockframes/contract/contract/+state/contract.model';
import { MovieLegalDocuments } from '../+state/movie.firestore';

// LEGAL DOCUMENTS

function createLegalDocumentControl(legalDocument?: Partial<LegalDocument>) {
  const { id, label, media, language, country } = createLegalDocument(legalDocument);
  return {
    id: new FormControl(id),
    label: new FormControl(label),
    media: new FormControl(media.url, urlValidators),
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
    main: new MovieMainForm(entity.main),
    promotionalElements: new MoviePromotionalElementsForm(entity.promotionalElements),
    promotionalDescription: new MoviePromotionalDescriptionForm(entity.promotionalDescription),
    story: new MovieStoryForm(entity.story),
    salesCast: new MovieSalesCastForm(entity.salesCast),
    salesInfo: new MovieSalesInfoForm(entity.salesInfo),
    versionInfo: new MovieVersionInfoForm(entity.versionInfo.languages),
    festivalPrizes: new MovieFestivalPrizesForm(entity.festivalPrizes),
    salesAgentDeal: new MovieSalesAgentDealForm(entity.salesAgentDeal),
    budget: new MovieBudgetForm(entity.budget),
    movieReview: FormList.factory(entity.movieReview, review => new MovieReviewForm(review)),
    documents: new MovieLegalDocumentsForm(entity.documents),
  }
}

export type MovieControl = ReturnType<typeof createMovieControls>;

@Injectable()
export class MovieForm extends FormEntity<MovieControl, Movie> {
  constructor() {
    super(createMovieControls({}));
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

  get main() {
    return this.get('main');
  }

  get festivalPrizes() {
    return this.get('festivalPrizes');
  }

  get salesCast() {
    return this.get('salesCast');
  }

  get salesInfo() {
    return this.get('salesInfo');
  }

  get promotionalDescription() {
    return this.get('promotionalDescription');
  }

  get story() {
    return this.get('story');
  }

  get movieReview() {
    return this.get('movieReview');
  }

  get budget() {
    return this.get('budget');
  }

  get versionInfo() {
    return this.get('versionInfo');
  }

  get promotionalElements() {
    return this.get('promotionalElements');
  }
}
