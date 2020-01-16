import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieFestivalPrizesForm } from './festival-prizes.form';
import { PremiereType } from '@blockframes/movie/movie+state/movie.firestore';


@Component({
  selector: '[form] movie-form-festivalprizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFestivalPrizesComponent {
  
  @Input() form: MovieFestivalPrizesForm;
  public premiereType = PremiereType;

  constructor() { }

  get premiereTypes() {
    return Object.keys(PremiereType);
  }

  get prizes() {
    return this.form.get('prizes');
  }

  public getPrizeName(i: number) {
    const control = this.form.getPrize(i);
    return control.get('name').value ? control.get('name').value : 'unnamed festival';
  }

  public getPrizeLogo(i: number) {
    const control = this.form.getPrize(i);
    return control.get('logo').value;
  }
}
