import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesCast, createMovieSalesCast } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[movieSalesCast] movie-display-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesCastComponent {

  public data : MovieSalesCast;
  @Input() set movieSalesCast(movieSalesCast: Partial<MovieSalesCast>) {
    this.data = createMovieSalesCast(movieSalesCast);
  }

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) { //@todo #643 factorize with other components ?
    return getLabelBySlug(scope, slug) as string;
  }
}
