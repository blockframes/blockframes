import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService, Delivery } from '../+state';
import { Movie, MovieQuery } from '@blockframes/movie';
import { MaterialStore, MaterialQuery } from '../../material/+state';
import { Router } from '@angular/router';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit, OnDestroy {
  public movie: Movie;
  public delivery: Delivery;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;
  public allChecked: boolean;
  public buttonLabel = 'Select all materials';
  private isAlive = true;

  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.delivery = this.query.getActive();
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.query.materialsByActiveDelivery$;
    this.progressionValue$ = this.query.deliveryProgression$;
    this.allChecked = false;
  }

  public selectMaterial(isChecked: any, id: string) {
    isChecked ? this.materialStore.addActive(id) : this.materialStore.removeActive(id);
  }

  public log(bool) {
    console.log(bool)
  }

  public selectAllMaterials() {
    this.allChecked = !this.allChecked;
    if (this.allChecked === true) {
      this.buttonLabel = 'Unselect materials';
      this.materials$.subscribe(categories =>
        Object.keys(categories).forEach(categoryKey =>
          categories[categoryKey].map(material => this.materialStore.addActive(material.id))
        )
      );
    }
    if (this.allChecked === false) {
      this.buttonLabel = 'Select all materials';
      this.materials$.subscribe(categories =>
        Object.keys(categories).forEach(categoryKey =>
          categories[categoryKey].map(material => this.materialStore.removeActive(material.id))
        )
      );
    }
  }

  public changeState(state: string) {
    const materials = this.materialQuery.getActive();
    this.service.updateMaterialState(materials, state);
    this.materialStore.returnToInitialState();
    this.allChecked = false;
    this.buttonLabel = 'Select all materials';
  }

  public editDelivery() {
    this.router.navigate([`layout/${this.movie.id}/form/${this.query.getActiveId()}`]);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
