import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateView } from '../../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialDeliveryForm, MaterialService } from '../../../material/+state';
import { MaterialStore, MaterialQuery } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery, Delivery } from '../../+state';
import { ConfirmComponent } from '@blockframes/ui';
import { map, startWith } from 'rxjs/operators';
import { createMaterialFormList } from '../../forms/material.form';
import { FormGroup } from '@angular/forms';
import { MaterialInformationsForm } from '../../forms/material-edit.form';

@Component({
  selector: 'delivery-editable',
  templateUrl: './delivery-editable.component.html',
  styleUrls: ['./delivery-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEditableComponent implements OnInit {
  public delivery$: Observable<Delivery>;
  public materials$: Observable<Material[]>;
  public movie$: Observable<Movie>;
  public materialInformationsForm: MaterialInformationsForm;
  public isDeliveryValidated$: Observable<boolean>;
  public materialId: string;
  public opened = false;

  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private materialStore: MaterialStore,
    private materialService: MaterialService,
    private service: DeliveryService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit() {

    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
    this.materials$ = this.materialQuery.selectAll();
    this.isDeliveryValidated$ = this.query.isDeliveryValidated$;

    this.materialInformationsForm = new MaterialInformationsForm(this.query.getValue().org);
  }

  public openSidenav(materialId: string) {
    this.materialStore.setActive(materialId);
    this.opened = true;
  }

  public update() {
    try {
      if (this.materialInformationsForm.invalid)
        throw new Error('Your material informations are not valid');
      const materialId = this.materialQuery.getActiveId()
      this.materialService.update(this.materialInformationsForm.value, materialId);
      this.snackBar.open('Material updated succesfully', 'close', { duration: 2000 });
      this.materialStore.removeActive(materialId)
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {

  }

  public saveAsTemplate() {
    this.dialog.open(NewTemplateComponent);
  }

  public deleteMaterial(material: Material) {
    this.service.deleteMaterial(material.id);
    this.snackBar.open('Deleted material "' + material.value + '".', 'close', { duration: 2000 });
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

  private async deleteDelivery() {
    await this.service.deleteDelivery();
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

  public signDelivery() {
    this.service.signDelivery();
  }

  public get deliveryContractURL$(): Observable<string> {
    return this.delivery$.pipe(
      map(({id}) => `/delivery/contract.pdf?deliveryId=${id}`)
    )
  }
}
