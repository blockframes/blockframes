import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsComponent {

  constructor(private form: MovieForm) { }

  get main() {
    return this.form.get('main');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

}
