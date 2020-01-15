import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalElements, createMoviePromotionalElements } from '../../+state';

@Component({
  selector: '[elements] movie-display-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalElementsComponent {

  public data : MoviePromotionalElements;
  @Input() set elements(promotionalElements: Partial<MoviePromotionalElements>) {
    this.data = createMoviePromotionalElements(promotionalElements);
  }

  // TODO#1573 update movie/display
  // get shouldDisplayPromotionalElements()  {
  //   return this.data.images.length > 0 ||
  //   this.data.promotionalElements.length > 0
  // }

}
