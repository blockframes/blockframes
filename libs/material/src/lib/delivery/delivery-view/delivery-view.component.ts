import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService, Delivery } from '../+state';
import { Movie, MovieQuery } from '@blockframes/movie';
import { MaterialStore, MaterialQuery } from '../../material/+state';
import { TemplateView } from '../../template/+state';
import { applyTransaction } from '@datorama/akita';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public delivery$: Observable<Delivery>;
  public materials$: Observable<TemplateView>;
  public progressionValue$: Observable<number>;
  public allChecked: boolean;

  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private materialStore: MaterialStore,
    private materialQuery: MaterialQuery,
  ) {}

  ngOnInit() {
    this.delivery$ = this.query.selectActive();
    this.movie$ = this.movieQuery.selectActive();
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

}
