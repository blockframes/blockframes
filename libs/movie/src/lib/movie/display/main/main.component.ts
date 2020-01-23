import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMain, createMovieMain } from '../../+state';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[main] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {

  public data : MovieMain;
  public getLabelBySlug = getLabelBySlug;
  @Input() set main(main: Partial<MovieMain>) {
    this.data = createMovieMain(main);
  }

  get shouldDisplayMainInformations()  {
    return this.data.genres.length > 0 ||
      this.data.originCountries ||
      this.data.originalLanguages.length > 0 ||
      this.data.stakeholders.executiveProducer.length > 0 ||
      this.data.shortSynopsis ||
      this.data.totalRunTime ||
      this.data.status
  }
}
