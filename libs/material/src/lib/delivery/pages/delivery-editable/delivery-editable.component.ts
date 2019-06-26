import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateView } from '../../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialDeliveryForm } from '../../../material/+state';
import { MaterialStore, MaterialQuery, MaterialService } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery, Delivery } from '../../+state';
import { ConfirmComponent } from '@blockframes/ui';
import { applyTransaction } from '@datorama/akita';

@Component({
  selector: 'delivery-editable',
  templateUrl: './delivery-editable.component.html',
  styleUrls: ['./delivery-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEditableComponent implements OnInit {
  public delivery$: Observable<Delivery>;
  public materials$: Observable<TemplateView>;
  public movie$: Observable<Movie>;
  public form$: Observable<MaterialDeliveryForm>;
  public isDeliveryValidated$: Observable<boolean>;
  public materialId: string;
  public allChecked: boolean;

  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private materialStore: MaterialStore,
    private service: DeliveryService,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit() {

    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
    this.materials$ = this.materialQuery.materialsByDelivery$;
    this.isDeliveryValidated$ = this.query.isDeliveryValidated$;
    this.form$ = this.materialQuery.deliveryForm$;

    this.allChecked = false;
  }

  public saveAsTemplate() {
    this.dialog.open(NewTemplateComponent);
  }

  public addMaterial(material: Material) {
    this.service.saveMaterial(material);
    this.materialStore.clearForm();
    // TODO: Make it scroll to the form.
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
    this.snackBar.open('Deleted material "' + material.value + '".', 'close', { duration: 2000 });
  }

  public updateMaterial(material: Material) {
    this.service.updateMaterial(material);
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyDeliveryForm(category);
    delete this.materialId;
  }

  public openDeleteDelivery() {
    this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete delivery',
        question: 'Are you sure you want to delete this delivery ?',
        buttonName: 'Delete',
        onConfirm: () => this.deleteDelivery()
      }
    });
  }

  private deleteDelivery() {
    this.service.deleteDelivery();
    this.router.navigate([`/layout/o/${this.movieQuery.getActiveId()}/list`]);
    this.snackBar.open('Delivery deleted', 'close', { duration: 2000 });
  }

  public openUnsealDelivery() {
    this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Unseal delivery',
        question: 'Are you sure you want to unseal this delivery ?',
        buttonName: 'Unseal',
        onConfirm: () => this.unsealDelivery()
      }
    });
  }

  private unsealDelivery() {
    this.service.unsealDelivery();
    this.snackBar.open('Delivery unsealed', 'close', { duration: 2000 });
  }

  openUpdateForm(material) {
    this.materialId = material.id;
    this.materialStore.clearForm();
  }

  cancelUpdateForm() {
    delete this.materialId;
  }

  public selectMaterial(isChecked: any, id: string) {
    isChecked ? this.materialStore.addActive(id) : this.materialStore.removeActive(id);
  }

  public selectAllMaterials() {
    this.allChecked = !this.allChecked;
    const process = this.allChecked
      ? material => this.materialStore.addActive(material.id)
      : material => this.materialStore.removeActive(material.id);
      applyTransaction(() => this.materialQuery.getAll().forEach(process))
  }

  public deleteSelectedMaterials() {
    const materials = this.materialQuery.getActive();
    this.materialService.deleteMaterials(materials);
    this.materialStore.returnToInitialState();
    this.allChecked = false;
    // TODO: Notify which and how much materials have been deleted with snackbar
  }

  public changeStep(stepId: string) {
    const materials = this.materialQuery.getActive();
    this.materialService.updateStep(materials, stepId);
    this.materialStore.returnToInitialState();
    this.allChecked = false;
  }

  public signDelivery() {
    this.service.signDelivery();
  }
}
