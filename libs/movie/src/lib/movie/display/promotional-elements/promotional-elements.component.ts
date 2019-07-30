import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalElements, createMoviePromotionalElements } from '../../+state';

@Component({
  selector: '[promotionalElements] movie-display-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalElementsComponent {

  public data : MoviePromotionalElements;
  @Input() set promotionalElements(promotionalElements: Partial<MoviePromotionalElements>) {
    this.data = createMoviePromotionalElements(promotionalElements);
  }

  get shouldDisplayPromotionalElements()  {
    return this.data.images.length > 0 ||
    this.data.promotionalElements.length > 0
  }

}
