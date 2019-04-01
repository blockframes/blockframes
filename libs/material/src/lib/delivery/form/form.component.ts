import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateQuery, TemplateView } from '../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { NewTemplateComponent } from './new-template.component';
import { Material, MaterialForm } from '../../material/+state/material.model';
import { MaterialStore, MaterialService, MaterialQuery } from '../../material/+state';
import { DeliveryService } from '../+state/delivery.service';

@Component({
  selector: 'delivery-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {
  public delivery$: Observable<TemplateView>;
  public form$: Observable<MaterialForm>;

  constructor(
    private templateQuery: TemplateQuery,
    private materialQuery: MaterialQuery,
    private deliveryService: DeliveryService,
    private dialog: MatDialog,
    private materialStore: MaterialStore,
    private materialService: MaterialService,
  ) {}

  ngOnInit() {
    this.delivery$ = this.templateQuery.materialsByTemplate$;

    this.form$ = this.materialQuery.select(state => state.form);
  }

  public openDialog() {
    this.dialog.open(NewTemplateComponent);
  }

  public createDelivery() {
    this.deliveryService.createDelivery();
  }

  public addMaterial(material: Material) {
    this.materialService.addMaterial(material);
    this.materialStore.updateRoot({form: null})
  }

  public deleteMaterial(material: Material) {
    this.materialService.deleteMaterial(material.id);
  }

  public addForm(category: string) {
    this.materialStore.updateRoot({form: {value: "", description: "", category}})
  }
}
