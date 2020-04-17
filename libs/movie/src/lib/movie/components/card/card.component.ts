import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../+state/movie.model';
import { ImgRef } from '@blockframes/utils/image-uploader';
import { scaleIn } from '@blockframes/utils/animations/fade';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public id: string;
  public image: ImgRef;
  public hasOverlay = false;

  @Input() size: 'banner' | 'poster' | 'square';
  @Input() set movie(movie: Movie) {
    if (movie) {
      this.id = movie.id
      this.image = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
    }
  }

  toggleOverlay() {
    this.hasOverlay = !this.hasOverlay
  }
}

