import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-form-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormReviewscComponent {
  form = this.shell.form;
  public premiereType = staticModels.PREMIERE_TYPE;

  constructor(private shell: MovieFormShellComponent) {}

  get prizes() {
    return this.festival.get('prizes');
  }

  get festival() {
    return this.form.get('festivalPrizes');
  }

  get reviews() {
    return this.form.get('movieReview');
  }

}
