import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoControl } from '../sales-info.form';
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] movie-form-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent {

  @Input() form: MovieSalesInfoControl['rating'];
  ratings = staticModels.RATING;

}
