import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalDescription, createMoviePromotionalDescription } from '../../+state';

@Component({
  selector: '[promotionalDescription] movie-display-promotional-description',
  templateUrl: './promotional-description.component.html',
  styleUrls: ['./promotional-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalDescriptionComponent {

  public data : MoviePromotionalDescription;
  @Input() set promotionalDescription(promotionalDescription: Partial<MoviePromotionalDescription>) {
    this.data = createMoviePromotionalDescription(promotionalDescription);
  }

}
