import { MovieLanguageSpecification } from './../../+state/movie.firestore';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { createMovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.model';

@Component({
  selector: '[info] movie-display-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayVersionInfoComponent {

  public data: MovieLanguageSpecification;

  @Input() set info(versionInfo: Partial<MovieLanguageSpecification>) {
    this.data = createMovieLanguageSpecification(versionInfo);
  }
}
