import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService } from '../+state';
import { Movie, MovieQuery } from '@blockframes/movie';
import { Material, MaterialStore, MaterialQuery } from '../../material/+state';
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
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.query.materialsByActiveDelivery$;
    this.progressionValue$ = this.query.deliveryProgression$;
  }

  public selectMaterial(isChecked: any, id: string) {
    isChecked
      ? this.materialStore.addActive(id)
      : this.materialStore.removeActive(id)
    console.log(this.materialQuery.getActive())
  }

  public changeState(state: string) {
    const materials = this.materialQuery.getActive();
    this.service.updateMaterialState(materials, state);
    this.materialStore.returnToInitialState();
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }

  public editDelivery() {
    this.router.navigate([`layout/${this.movie.id}/form/${this.query.getActiveId()}`])
  }
}
