import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { DeliveryQuery } from '../+state';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    this.materials$ = this.query.materialsByActiveDelivery$;
    this.progressionValue$ = this.query.deliveryProgression$;
  }

  public editDelivery() {
    const movieId = this.movieQuery.getActiveId();
    const deliveryId = this.query.getActiveId();
    this.router.navigate([`layout/${movieId}/form/${deliveryId}`]);
  }

  public goBack() {
    this.location.back();
  }
}
