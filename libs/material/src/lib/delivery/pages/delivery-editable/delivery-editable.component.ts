import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialService, MaterialStore, MaterialStatus } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery, Delivery } from '../../+state';
import { ConfirmComponent } from '@blockframes/ui';
import { map, tap, switchMap, takeUntil } from 'rxjs/operators';
import { MaterialForm } from '../../forms/material.form';
import { AbstractControl } from '@angular/forms';
import { applyTransaction } from '@datorama/akita';
import { utils } from 'ethers';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'delivery-editable',
  templateUrl: './delivery-editable.component.html',
  styleUrls: ['./delivery-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEditableComponent implements OnInit, OnDestroy {
  public delivery$: Observable<Delivery>;
  public materials$: Observable<Material[]>;
  public movie$: Observable<Movie>;
  public opened = false;
  public displayedColumns: string[];
  public pdfLink: string;

  // TODO: use it
  public form = new MaterialForm();
  public activeForm$: Observable<AbstractControl>;

  private destroyed$ = new Subject();


  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private materialService: MaterialService,
    private service: DeliveryService,
    private materialStore: MaterialStore,
    private organizationService: OrganizationService,
    private organizationQuery: OrganizationQuery,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    //Generate a formList with disabled fields (or not) depending on delivery isSigned property
    // this.query.selectActive()
    //   .pipe(
    //     takeUntil(this.destroyed$),
    //     //tap(delivery => this.form = !!delivery.isSigned ? new MaterialForm(delivery.isSigned) : new MaterialForm()),
    //   ).subscribe(delivery => !!delivery.isSigned ? this.form.disableForm() : null);

    // this.materials$ = this.materialQuery.selectAll().pipe(
    //   tap(materials => this.form.upsertValue(materials)),
    //   switchMap(materials => this.form.selectAll())
    // );

    // this.query.selectActive()
    //   .pipe(
    //     takeUntil(this.destroyed$),
    //     //tap(delivery => this.form = !!delivery.isSigned ? new MaterialForm(delivery.isSigned) : new MaterialForm()),
    //   ).subscribe(delivery => !!delivery.isSigned ? this.form.disableForm() : null);

    this.materials$ = combineLatest([this.query.selectActive(), this.materialQuery.selectAll()]).pipe(
      switchMap(([delivery, materials]) => {
        this.form.upsertValue(materials);
        this.form.switchForm(delivery.isSigned);
        return this.form.selectAll();
      })
    )

    this.activeForm$ = this.form.selectActive();

    this.pdfLink = `/delivery/contract.pdf?deliveryId=${this.query.getActiveId()}`
    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
    this.displayedColumns = this.setDisplayedColumns();
  }

  /* Open the sidenav with selected material form **/
  public openSidenav(materialId: string) {
    this.form.setActive(materialId);
    this.opened = true;
  }

  /* Update a list of materials **/
  public update() {
    try {
      const delivery = this.query.getActive();
      const materials = this.form.getAll();
      delivery.mustBeSigned
        ? this.materialService.updateDeliveryMaterials(materials, delivery)
        : this.materialService.update(materials, delivery);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  /* Add a material formGroup to the formList **/
  public addMaterial() {
    const newMaterial = this.materialService.add();
    this.form.add(newMaterial);
    this.openSidenav(newMaterial.id);
  }

  /* Select a single material to perform an action **/
  public selectMaterial(material: Material) {
    this.materialQuery.hasActive(material.id)
      ? this.materialStore.removeActive(material.id)
      : this.materialStore.addActive(material.id);
  }

  /* Select all materials to perform an action **/
  public selectAllMaterials(isAllSelected: boolean) {
    const process = isAllSelected
      ? material => this.materialStore.addActive(material.id)
      : material => this.materialStore.removeActive(material.id);
    applyTransaction(() => this.materialQuery.getAll().forEach(process));
  }

  /* Update status of selected materials **/
  public updateStatus(status: MaterialStatus) {
    const materials = this.materialQuery.getActive();
    const delivery = this.query.getActive();
    delivery.mustBeSigned
      ? this.materialService.updateDeliveryMaterialStatus(materials, status, delivery.id)
      : this.materialService.updateStatus(materials, status, delivery.movieId);
    this.snackBar.open(`Material status updated to ${status}`, 'close', { duration: 2000 });
    this.materialStore.returnToInitialState();
  }

  /* Switch isOrdered boolean value of selected materials **/
  public materialIsOrdered() {
    const materials = this.materialQuery.getActive();
    const delivery = this.query.getActive();
    delivery.mustBeSigned
      ? this.materialService.updateDeliveryMaterialIsOrdered(materials, delivery.id)
      : this.materialService.updateIsOrdered(materials, delivery.movieId);
    this.materialStore.returnToInitialState();
  }

  /* Switch isPaid boolean value of selected materials **/
  public materialsIsPaid() {
    const materials = this.materialQuery.getActive();
    const delivery = this.query.getActive();
    delivery.mustBeSigned
      ? this.materialService.updateDeliveryMaterialIsPaid(materials, delivery.id)
      : this.materialService.updateIsPaid(materials, delivery.movieId);
    this.materialStore.returnToInitialState();
  }

  /* Create a new template from delivery materials **/
  public saveAsTemplate() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.form.getAll();
    this.dialog.open(NewTemplateComponent, dialogConfig);
  }

  public openDeleteMaterial(materialId: string) {
    this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete material',
        question: 'Are you sure you want to delete this material ?',
        buttonName: 'Delete',
        onConfirm: () => this.deleteMaterial(materialId)
      }
    });
  }

  public deleteMaterial(materialId: string) {
    try {
      // If material exist in formList but not in database
      if (!this.materialQuery.hasEntity(materialId)) {
        this.form.removeControl(materialId);
        this.opened = false;
        return;
      }
      const delivery = this.query.getActive();
      delivery.mustBeSigned
        ? this.materialService.deleteDeliveryMaterial(materialId, delivery.id)
        : this.materialService.delete(materialId, delivery);
      this.snackBar.open('Material deleted', 'close', { duration: 2000 });
      this.opened = false;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
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
    this.router.navigate([`/layout/o/delivery/${this.movieQuery.getActiveId()}/list`]);
    this.snackBar.open('Delivery deleted', 'close', { duration: 2000 });
  }

  public openUnsealDelivery() {
    this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Unseal delivery',
        question: 'Are you sure you want to unseal this delivery ?',
        buttonName: 'Unseal',
        onConfirm: () => this.enableDelivery()
      }
    });
  }

  public enableDelivery() {
    this.service.unsealDelivery();
    this.opened = false;
    this.snackBar.open('Delivery unsealed', 'close', { duration: 2000 });
  }

  public async signDelivery() {
    const delivery = this.query.getActive();
    const jsonDelivery = JSON.stringify(delivery);

    const materials = this.materialQuery.getAll();
    const jsonMaterials = JSON.stringify(materials);

    const deliveryHash = utils.id(jsonDelivery + jsonMaterials);
    const orgAddress = await this.organizationService.getAddress();
    const orgId = this.organizationQuery.getValue().org.id;

    this.service.setSignDeliveryTx(orgAddress, delivery.id, deliveryHash, orgId);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  /* Define an array of columns to be displayed in the list depending on delivery settings **/
  public setDisplayedColumns() {
    const delivery = this.query.getActive();
    return delivery.mustChargeMaterials
      ? [
          'select',
          'value',
          'description',
          'step',
          'category',
          'price',
          'isOrdered',
          'isPaid',
          'status',
          'action'
        ]
      : ['select', 'value', 'description', 'step', 'category', 'status', 'action'];
  }

  public get deliveryContractURL$(): Observable<string> {
    return this.delivery$.pipe(map(({ id }) => `/delivery/contract.pdf?deliveryId=${id}`));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
