import { Component, Input, ChangeDetectionStrategy, HostListener } from '@angular/core';
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

  public id: string;
  public image: ImgRef;
  public title: Title;
  public directors: Credit[];
  public genres: string[];
  public date: number;
  public duration: string | number;
  public hovering = false;

  @Input() size: 'small' | 'medium' | 'large';
  @Input() set movie(movie: Movie) {
    if (movie) {
      this.id = movie.id
      this.image = movie.promotionalElements.poster[0] && movie.promotionalElements.poster[0].media;
      this.title = movie.main.title;
      this.directors = movie.main.directors;
      this.genres = movie.main.genres;
      this.date = movie.main.productionYear;
      this.duration = movie.main.totalRunTime;
    }
  }

  @HostListener('mouseenter')
  public onMouseEnter() {
    this.hovering = true;
    console.log(this.hovering)
  }

  @HostListener('mouseleave')
  public onMouseLeave() {
    this.hovering = false;
    console.log(this.hovering)
  }
}

