import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieVersionInfo, createMovieVersionInfo } from '../../+state';
import { getLabelByCode } from '../../staticModels';

@Component({
  selector: '[versionInfo] movie-display-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayVersionInfoComponent {

  public data: MovieVersionInfo;
  public getLabelByCode = getLabelByCode;
  @Input() set versionInfo(versionInfo: Partial<MovieVersionInfo>) {
    this.data = createMovieVersionInfo(versionInfo);
  }

}
