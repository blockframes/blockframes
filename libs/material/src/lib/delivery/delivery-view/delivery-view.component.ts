import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService, Delivery } from '../+state';
import { Movie, MovieQuery } from '@blockframes/movie';
import { MaterialStore, MaterialQuery, MaterialService } from '../../material/+state';
import { Router } from '@angular/router';
import { TemplateView } from '../../template/+state';
import { applyTransaction } from '@datorama/akita';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit, OnDestroy {
  public movie: Movie;
  public delivery: Delivery;
  public materials$: Observable<TemplateView>;
  public materialsSnap: Object;
  public progressionValue$: Observable<number>;
  public allChecked: boolean;
  public isAlive = true;

  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private materialService: MaterialService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.materialService
      .subscribeOnMovieMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();
    this.delivery = this.query.getActive();
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.query.currentTemplateView;
    this.progressionValue$ = this.query.deliveryProgression$;
    this.allChecked = false;
  }

  public selectMaterial(isChecked: boolean, id: string) {
    isChecked ? this.materialStore.addActive(id) : this.materialStore.removeActive(id);
  }

  public selectAllMaterials() {
    this.allChecked = !this.allChecked;
    const process = this.allChecked
      ? material => this.materialStore.addActive(material.id)
      : material => this.materialStore.removeActive(material.id);
      applyTransaction(() => this.materialQuery.getAll().forEach(process))
  }

  public changeState(state: 'pending' | 'available' | 'delivered' | 'accepted' | 'refused') {
    const materials = this.materialQuery.getActive();
    this.service.updateMaterialState(materials, state);
    this.materialStore.returnToInitialState();
    this.allChecked = false;
  }

  public editDelivery() {
    this.router.navigate([`layout/${this.movie.id}/form/${this.query.getActiveId()}`]);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
