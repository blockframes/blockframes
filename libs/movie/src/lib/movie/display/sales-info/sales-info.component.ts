import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesInfo, createMovieSalesInfo } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[salesInfo] movie-display-sales-info',
  templateUrl: './sales-info.component.html',
  styleUrls: ['./sales-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesInfoComponent {

  public data: MovieSalesInfo;
  @Input() set salesInfo(salesInfo: Partial<MovieSalesInfo>) {
    this.data = createMovieSalesInfo(salesInfo);
  }

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) {
    return getLabelBySlug(scope, slug) as string;
  }

}
