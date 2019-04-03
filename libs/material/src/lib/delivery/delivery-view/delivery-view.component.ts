import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView } from './../../template/+state';
import { MaterialForm, Material, MaterialStore, MaterialService, MaterialQuery } from './../../material/+state';
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

    this.form$ = this.materialQuery.form$;

    this.materialService.subscribeOnDeliveryMaterials$.pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public addMaterial(material: Material) {
    this.materialService.saveMaterialInDelivery(material);
    this.materialStore.updateRoot({form: null})
  }

  public deleteMaterial(material: Material) {
    this.materialService.deleteMaterialInDelivery(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyForm(category);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
