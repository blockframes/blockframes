import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePrizeForm } from '../movie.form';
import { staticConsts } from '@blockframes/utils/static-model';


@Component({
  selector: '[form] movie-form-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFestivalPrizesComponent {

  @Input() form: MoviePrizeForm;
  public premiereType = staticConsts.premiereType;

  constructor() { }

}
