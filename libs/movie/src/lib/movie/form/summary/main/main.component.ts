import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '@blockframes/movie/movieform/main/main.form';

@Component({
  selector: '[main] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryMainComponent {
  @Input() main: MovieMainForm;
}
