import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialService, MaterialStore, MaterialStatus } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery, Delivery } from '../../+state';
import { ConfirmComponent } from '@blockframes/ui';
import { map, startWith, tap, switchMap, filter, takeUntil } from 'rxjs/operators';
import { createMaterialFormList, createMaterialFormGroup } from '../../forms/material.form';
import { FormGroup } from '@angular/forms';
import { applyTransaction } from '@datorama/akita';
import { utils } from 'ethers';
import { OrganizationService } from '@blockframes/organization';
import { FormList } from '@blockframes/utils';

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
  private selectedMaterialId$ = new BehaviorSubject<string>(null);

  public materialFormGroup$: Observable<FormGroup>;
  public currentFormList: FormList<Material, any> = createMaterialFormList();

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
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    // Generate a formList with disabled fields (or not) depending on delivery isSigned property
    this.query.selectActive()
      .pipe(
        takeUntil(this.destroyed$),
        map(delivery =>  createMaterialFormList(delivery.isSigned))
      )
      .subscribe(formList => this.currentFormList = formList);

    this.materials$ = this.materialQuery.selectAll().pipe(
      tap(materials => this.currentFormList.patchValue(materials)),
      switchMap(materials => this.currentFormList.valueChanges.pipe(startWith(materials))
      )
    );

    // Return the materialFormGroup linked to the selected materialId
    this.materialFormGroup$ = this.selectedMaterialId$.pipe(
      filter(materialId => !!materialId),
      map(materialId => {
        return this.currentFormList.value.findIndex(material => material.id === materialId);
      }),
      map(index => {
        return this.currentFormList.at(index);
      })
    );

    this.pdfLink = `/delivery/contract.pdf?deliveryId=${this.query.getActiveId()}`
    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
    this.displayedColumns = this.setDisplayedColumns();
  }

  /* Open the sidenav with selected material form **/
  public openSidenav(materialId: string) {
    this.selectedMaterialId$.next(materialId);
    this.opened = true;
  }

  /* Update a list of materials **/
  public update() {
    try {
      const delivery = this.query.getActive();
      delivery.mustBeSigned
        ? this.materialService.updateDeliveryMaterials(this.currentFormList.value, delivery)
        : this.materialService.update(this.currentFormList.value, delivery);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  /* Add a material formGroup to the formList **/
  public addMaterial() {
    const newMaterial = this.materialService.add();
    this.currentFormList.push(createMaterialFormGroup(newMaterial));
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
    this.dialog.open(NewTemplateComponent);
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
        const index = this.currentFormList.value.findIndex(material => material.id === materialId);
        this.currentFormList.removeAt(index);
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

    this.service.setSignDeliveryTx(orgAddress, delivery.id, deliveryHash);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public disableDelivery() {
    // No clue about what to do here
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
