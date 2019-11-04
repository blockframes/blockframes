import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'movie-display-film-details',
  templateUrl: './display-film-details.component.html',
  styleUrls: ['./display-film-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayFilmDetailsComponent {
  @Input() main;
  @Input() salesInfo;
  @Input() color;
  @Input() europeanQualification;
  @Input() movieSalesInfo;
}
