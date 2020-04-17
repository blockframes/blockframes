import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../+state/movie.model';
import { scaleIn } from '@blockframes/utils/animations/fade';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public hasOverlay = false;

  @Input() size: 'banner' | 'poster' | 'avatar';
  @Input() movie: Movie;
  @Input() link = "..";
}

