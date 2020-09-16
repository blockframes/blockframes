import { Component, Directive, Input } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: '[movie] title-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class TitleDashboardHeaderComponent {

  @Input() movie: Movie;

  constructor() {}

}



@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]',
  host: { class: 'movie-header-actions' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeaderActions { }
