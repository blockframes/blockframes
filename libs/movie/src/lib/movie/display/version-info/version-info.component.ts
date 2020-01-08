import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { getLabelByCode } from '../../static-model/staticModels';

@Component({
  selector: '[info] movie-display-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayVersionInfoComponent {

  public data: MovieVersionInfo;
  public getLabelByCode = getLabelByCode;
  @Input() set info(versionInfo: Partial<MovieVersionInfo>) {
    this.data = createMovieVersionInfo(versionInfo);
  }

}
