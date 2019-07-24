import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalElements } from '../../+state';

@Component({
  selector: '[data] movie-display-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalElementsComponent {

  @Input() data: MoviePromotionalElements;

}
