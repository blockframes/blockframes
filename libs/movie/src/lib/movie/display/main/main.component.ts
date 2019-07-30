import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMain, createMovieMain } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[main] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {

  public data : MovieMain;
  @Input() set main(main: Partial<MovieMain>) {
    this.data = createMovieMain(main);
  }

  get shouldDisplayMainInformations()  {
    return this.data.genres.length > 0 ||
      this.data.originCountry ||
      this.data.languages.length > 0 ||
      this.data.productionCompanies.length > 0 ||
      this.data.shortSynopsis ||
      this.data.length ||
      this.data.status
  }

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) {
    return getLabelBySlug(scope, slug) as string;
  }
}
