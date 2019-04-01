import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView } from '../../../template/+state';
import { MaterialForm, Material, MaterialStore, MaterialService, MaterialQuery } from '../../../material/+state';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit, OnDestroy {
  public delivery$: Observable<TemplateView>;
  public form$ : Observable<MaterialForm>;
  private isAlive = true;

  constructor(
    private materialStore: MaterialStore,
    private materialService: MaterialService,
    private materialQuery: MaterialQuery,
  ) { }

  ngOnInit() {
    this.delivery$ = this.materialQuery.materialsByDelivery$;

    this.form$ = this.materialQuery.select(state => state.form);

    this.materialService.subscribeOnDeliveryMaterials$.pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public addMaterial(material: Material) {
    this.materialService.addMaterialForDelivery(material);
    this.materialStore.updateRoot({form: null})
  }

  public deleteMaterial(material: Material) {
    this.materialService.deleteMaterialForDelivery(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateRoot({form: {value: "", description: "", category}})
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
