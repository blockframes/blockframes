import { MovieLanguageSpecification } from './../../+state/movie.firestore';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[info] movie-display-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayVersionInfoComponent {

  public data: MovieLanguageSpecification;
  // TODO #1562
/*   public getLabelByCode = getLabelByCode;
  @Input() set info(versionInfo: Partial<MovieLanguageSpecification>) {
    this.data = createMovieVersionInfo(versionInfo);
  } */


}
