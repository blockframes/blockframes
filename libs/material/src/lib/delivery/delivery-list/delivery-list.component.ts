import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Delivery } from '../+state/delivery.model';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryService, DeliveryQuery } from '../+state';
import { Router } from '@angular/router';


@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit {
  public movie$: Observable<Movie>;
  public deliveries$: Observable<Delivery[]>;

  constructor(
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private router: Router,
    private query: DeliveryQuery,
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.deliveries$ = this.query.selectAll();
  }

  public async selectDelivery(delivery: Delivery, movieId: string) {
    const validated = await this.service.isDeliveryValidated(delivery.id);
    validated
      ? this.router.navigate([`layout/${movieId}/${delivery.id}/view`])
      : this.router.navigate([`layout/${movieId}/${delivery.id}/edit`]);
  }

}
