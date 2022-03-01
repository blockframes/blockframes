import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: '[movie][link] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class SummaryMainComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  productionLink$: Observable<string> = this.route.params.pipe(
    pluck('movieId'),
    map((movieId: string) => `/c/o/dashboard/tunnel/movie/${movieId}/title-status`)
  );

  constructor(private route: ActivatedRoute,) {}

  get title() {
    return this.movie.get('title');
  }

  get genres() {
    return [this.movie.get('genres'), ...this.movie.get('customGenres').controls];
  }

}
