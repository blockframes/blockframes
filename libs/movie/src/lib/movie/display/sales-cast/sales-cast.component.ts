import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesCast, createMovieSalesCast } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[salesCast] movie-display-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesCastComponent {

  public data : MovieSalesCast;
  @Input() set salesCast(salesCast: Partial<MovieSalesCast>) {
    this.data = createMovieSalesCast(salesCast);
  }

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) { //@todo #643 factorize with other components ?
    return getLabelBySlug(scope, slug) as string;
  }
}
