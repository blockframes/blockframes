import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService } from '../+state';
import { Movie, MovieQuery } from '@blockframes/movie';
import { Material } from '../../material/+state';
import { Router } from '@angular/router';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public movie: Movie;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private deliveryQuery: DeliveryQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.deliveryQuery.materialsByActiveDelivery$;
    this.progressionValue$ = this.deliveryQuery.deliveryProgression$;
  }

  public deliveredToggle(material: Material, movieId: string) {
    this.service.deliveredToggle(material, movieId).catch(err => console.log(err));
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }

  public editDelivery(deliveryId: string) {
    this.router.navigate([`layout/${this.movie.id}/form/${this.query.getActiveId()}`])
  }
}
