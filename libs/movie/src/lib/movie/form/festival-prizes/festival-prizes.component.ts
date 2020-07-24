import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePrizesForm } from './festival-prizes.form';
import { premiereType } from '@blockframes/movie/+state/movie.firestore';


@Component({
  selector: '[form] movie-form-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFestivalPrizesComponent {

  @Input() form: MoviePrizesForm;
  public premiereType = premiereType;

  constructor() { }

  get prizes() {
    return this.form.get('prizes');
  }
}
