import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesCast, createMovieSalesCast } from '../../+state';

@Component({
  selector: '[cast] movie-display-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesCastComponent {

  public data : MovieSalesCast;

  @Input() set cast(salesCast: Partial<MovieSalesCast>) {
    this.data = createMovieSalesCast(salesCast);
  }

}
