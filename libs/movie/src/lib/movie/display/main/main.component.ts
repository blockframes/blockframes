import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '@blockframes/movie/movieform/main/main.form';
import { MovieFestivalPrizesForm } from '@blockframes/movie/movieform/festival-prizes/festival-prizes.form';
import { MovieSalesCastForm } from '@blockframes/movie/movieform/sales-cast/sales-cast.form';
import { MovieSalesInfoForm } from '@blockframes/movie/movieform/sales-info/sales-info.form';

@Component({
  selector: '[main] [festivalPrizes] [salesCast] [salesInfo] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {
  @Input() main: MovieMainForm;
  @Input() festivalPrizes: MovieFestivalPrizesForm;
  @Input() salesCast: MovieSalesCastForm;
  @Input() salesInfo: MovieSalesInfoForm;

  public get genres() {
    return this.main.genres.controls.concat(this.main.customGenres.controls);
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

  public get totalRunTime() {
    return this.main.get('totalRunTime');
  }

  public get status() {
    return this.main.get('status');
  }

  public get workType() {
    return this.main.get('workType');
  }

  public get storeType() {
    return this.main.storeConfig.get('storeType');
  }

  public get original() {
    return this.main.title.get('original');
  }

  public get international() {
    return this.main.title.get('international');
  }
}
