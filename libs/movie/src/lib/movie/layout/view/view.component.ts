// Angular
import { Component, Input, ChangeDetectionStrategy, Directive } from '@angular/core';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  @Input() navLinks: { path: string, label: string }[];

  movie$ = this.query.selectActive();

  constructor(private query: MovieQuery) { }

  public isEnoughPicturesThen(min: number) {
    return this.query.selectActive().pipe(filter(movie => Object.values(movie.promotional.still_photo).length > min));
  }
}

@Directive({
  selector: 'movie-header, [movieHeader]',
  host: { class: 'movie-header' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeader { }
