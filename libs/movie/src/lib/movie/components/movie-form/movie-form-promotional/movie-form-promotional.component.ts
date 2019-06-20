import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieForm } from '../movie.form';

@Component({
  selector: 'movie-form-promotional',
  templateUrl: './movie-form-promotional.component.html',
  styleUrls: ['./movie-form-promotional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormPromotionalComponent {

  constructor(
    public form: MovieForm
  ) {}
}
