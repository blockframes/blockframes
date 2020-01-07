import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesInfo, createMovieSalesInfo } from '../../+state';
import { getLabelByCode } from '../../static-model/staticModels';

@Component({
  selector: '[info] movie-display-sales-info',
  templateUrl: './sales-info.component.html',
  styleUrls: ['./sales-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesInfoComponent {

  public data: MovieSalesInfo;
  public getLabelByCode = getLabelByCode;
  @Input() set info(salesInfo: Partial<MovieSalesInfo>) {
    this.data = createMovieSalesInfo(salesInfo);
  }

}
