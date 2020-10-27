import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class SummaryMainComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  get title() {
    return this.movie.get('title');
  }

  public get genres() {
    return [this.movie.get('genres'), ...this.movie.get('customGenres').controls];
  }

}
