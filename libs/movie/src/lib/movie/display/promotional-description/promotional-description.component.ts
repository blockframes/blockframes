import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalDescription, createMoviePromotionalDescription } from '../../+state';

@Component({
  selector: '[moviePromotionalDescription] movie-display-promotional-description',
  templateUrl: './promotional-description.component.html',
  styleUrls: ['./promotional-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalDescriptionComponent {

  public data : MoviePromotionalDescription;
  @Input() set moviePromotionalDescription(moviePromotionalDescription: Partial<MoviePromotionalDescription>) {
    this.data = createMoviePromotionalDescription(moviePromotionalDescription);
  }

}
