import { Component, Input } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class SummaryMainComponent {

  @Input() movie: MovieForm;
  @Input() link: string;
  public movieId = this.query.getActiveId();
  public productionLink = `/c/o/dashboard/tunnel/movie/${this.movieId}/title-status`;

  constructor(private query: MovieQuery) {}

  get title() {
    return this.movie.get('title');
  }

  get genres() {
    return [this.movie.get('genres'), ...this.movie.get('customGenres').controls];
  }

}
