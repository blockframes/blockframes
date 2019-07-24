import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalDescription } from '../../+state';

@Component({
  selector: '[data] movie-display-promotional-description',
  templateUrl: './promotional-description.component.html',
  styleUrls: ['./promotional-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayPromotionalDescriptionComponent {

  @Input() data: MoviePromotionalDescription;

}
