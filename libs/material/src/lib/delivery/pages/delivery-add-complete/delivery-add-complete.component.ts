import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie';
import { DeliveryQuery } from '../../+state';

@Component({
  selector: 'delivery-add-complete',
  templateUrl: './delivery-add-complete.component.html',
  styleUrls: ['./delivery-add-complete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddCompleteComponent {
  constructor(
    private router: Router,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {}

  public navigate() {
    const movieId = this.movieQuery.getActiveId();
    const deliveryId = this.query.getActiveId();
    this.router.navigate([`/layout/o/delivery/${movieId}/${deliveryId}/list`]);
  }
}
