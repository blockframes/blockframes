// Angular
import { Component, Input, ChangeDetectionStrategy, Directive } from '@angular/core';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';

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
/* TODO MF: DONT USE A FUNC FOT THAT, RXJS IS THE KEY */
    return Object.values(this.query.getActive().promotional.still_photo).length > min
  }


}

@Directive({
  selector: 'movie-header, [movieHeader]',
  host: { class: 'movie-header' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeader { }
