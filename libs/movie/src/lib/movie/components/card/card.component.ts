import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie, Credit } from '../../+state/movie.model';
import { Title } from '../../+state/movie.firestore';
import { ImgRef } from '@blockframes/utils/image-uploader';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {

  public image: ImgRef;
  public title: Title;
  public directors: Credit[];
  public genres: string[];
  public date: number;
  public duration: string | number;

  @Input() size: string;
  @Input() set movie(movie: Movie) {
    if (movie) {
      this.image = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
      this.title = movie.main.title;
      this.directors = movie.main.directors;
      this.genres = movie.main.genres;
      this.date = movie.main.productionYear;
      this.duration = movie.main.totalRunTime;
    }
  }
}

