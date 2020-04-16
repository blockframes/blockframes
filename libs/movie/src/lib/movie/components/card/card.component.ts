import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie, MovieMain } from '../../+state/movie.model';
import { ImgRef } from '@blockframes/utils/image-uploader';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public id: string;
  public image: ImgRef;
  public main: MovieMain;

  @Input() size: 'small' | 'medium' | 'large';
  @Input() set movie(movie: Movie) {
    if (movie) {
      this.id = movie.id
      this.image = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
      this.main = movie.main
    }
  }
}

