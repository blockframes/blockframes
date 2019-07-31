import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesCast, createMovieSalesCast } from '../../+state';
import { getLabelByCode } from '../../staticModels';

@Component({
  selector: '[salesCast] movie-display-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesCastComponent {

  public data : MovieSalesCast;
  public getLabelByCode = getLabelByCode;

  @Input() set salesCast(salesCast: Partial<MovieSalesCast>) {
    this.data = createMovieSalesCast(salesCast);
  }

}
