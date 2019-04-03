import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateView } from './../../template/+state';
import { MaterialForm, Material, MaterialStore, MaterialQuery, MaterialService } from './../../material/+state';
import { takeWhile } from 'rxjs/operators';
import { DeliveryService } from '../+state';

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
    private service: DeliveryService,
    private materialService: MaterialService,
    private materialQuery: MaterialQuery,
  ) { }

  ngOnInit() {
    this.delivery$ = this.materialQuery.materialsByDelivery$;

    this.form$ = this.materialQuery.form$;

    this.materialService.subscribeOnDeliveryMaterials$.pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public addMaterial(material: Material) {
    this.service.saveMaterial(material);
    this.materialStore.clearForm();
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyForm(category);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
