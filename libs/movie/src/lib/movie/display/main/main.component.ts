import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMain } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[data] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {

  @Input() data: MovieMain;

  get shouldDisplayMainInformations()  {
    return (this.data.genres && this.data.genres.length > 0) ||
      (this.data.originCountry && this.data.originCountry.length > 0) ||
      (this.data.languages && this.data.languages.length > 0) ||
      (this.data.productionCompanies && this.data.productionCompanies.length > 0) ||
      this.data.shortSynopsis ||
      this.data.length ||
      (this.data.status && this.data.status.length > 0)
  }

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) {
    return getLabelBySlug(scope, slug) as string;
  }
}
