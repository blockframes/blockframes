import { EntityControl, FormEntity, FormList } from '@blockframes/utils';
import { FormArray } from '@angular/forms';
import { MovieMainForm } from './main/main.form';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { MoviePromotionalDescriptionForm } from './promotional-description/promotional-description.form';
import { MovieStoryForm } from './story/story.form';
import { MovieSalesCastForm } from './sales-cast/sales-cast.form';
import { Movie, createMovie } from '../+state';
import { MovieSalesInfoForm } from './sales-info/sales-info.form';
import { MovieVersionInfoForm } from './version-info/version-info.form';
import { MovieFestivalPrizesForm } from './festival-prizes/festival-prizes.form';
import { MovieSalesAgentDealForm } from './sales-agent-deal/sales-agent-deal.form';
import { MovieReviewForm } from './review/review.form';
import { MovieBudgetForm } from './budget/budget.form';
import { Injectable } from '@angular/core';


function createMovieControls(movie: Partial<Movie>) {
  const entity = createMovie(movie);
  return {
    main: new MovieMainForm(entity.main),
    promotionalElements: new MoviePromotionalElementsForm(entity.promotionalElements),
    promotionalDescription: new MoviePromotionalDescriptionForm(entity.promotionalDescription),
    story: new MovieStoryForm(entity.story),
    salesCast: new MovieSalesCastForm(entity.salesCast),
    salesInfo: new MovieSalesInfoForm(entity.salesInfo),
    versionInfo: new MovieVersionInfoForm(entity.versionInfo),
    festivalPrizes: new MovieFestivalPrizesForm(entity.festivalPrizes),
    salesAgentDeal: new MovieSalesAgentDealForm(entity.salesAgentDeal),
    budget: new MovieBudgetForm(entity.budget),
    movieReview: FormList.factory(entity.movieReview, review => new MovieReviewForm(review)),
  }
}

export type MovieControl = ReturnType<typeof createMovieControls>

@Injectable()
export class MovieForm extends FormEntity<MovieControl> {
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
}
