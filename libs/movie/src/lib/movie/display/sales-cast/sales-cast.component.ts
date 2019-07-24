import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieSalesCast } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[data] movie-display-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesCastComponent {

  @Input() data: MovieSalesCast;

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) { //@todo #643 factorize with other components ?
    return getLabelBySlug(scope, slug) as string;
  }
}
