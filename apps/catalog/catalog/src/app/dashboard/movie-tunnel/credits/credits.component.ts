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

  get productionYear() {
    return this.form.get('main').get('productionYear');
  }

  get stakeholders() {
    return this.form.get('main').get('stakeholders');
  }

  get producers() {
    return this.form.get('salesCast').get('producers');
  }

  get crew() {
    return this.form.get('salesCast').get('crew');
  }

  get cast() {
    return this.form.get('salesCast').get('cast');
  }

}
