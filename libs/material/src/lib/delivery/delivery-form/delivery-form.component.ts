import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateView } from '../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { NewTemplateComponent } from './new-template.component';
import { Material, MaterialForm } from '../../material/+state/material.model';
import { MaterialStore, MaterialQuery, MaterialService } from '../../material/+state';
import { DeliveryService } from '../+state/delivery.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-form',
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryFormComponent implements OnInit, OnDestroy {
  public delivery$: Observable<TemplateView>;
  public form$: Observable<MaterialForm>;
  public isAlive = true;

  constructor(
    private materialQuery: MaterialQuery,
    private dialog: MatDialog,
    private materialStore: MaterialStore,
    private service: DeliveryService,
    private materialService: MaterialService,
  ) {}

  ngOnInit() {
    this.delivery$ = this.materialQuery.materialsByDelivery$;

    this.form$ = this.materialQuery.form$;

    this.materialService.subscribeOnDeliveryMaterials$.pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public saveAsTemplate() {
    this.dialog.open(NewTemplateComponent);
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
