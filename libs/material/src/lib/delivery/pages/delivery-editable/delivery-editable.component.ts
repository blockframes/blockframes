import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialStore, MaterialStatus } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { ConfirmComponent } from '@blockframes/ui';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { MaterialForm, MaterialControl } from '../../forms/material.form';
import { applyTransaction } from '@datorama/akita';
import { id as keccak256 } from '@ethersproject/hash';
import { FormEntity } from '@blockframes/utils';
import { DaoService } from 'libs/ethers/src/lib/dao/+state';
import { MovieMaterialService } from '../../../material/+state/movie-material.service';
import { DeliveryMaterialService } from '../../../material/+state/delivery-material.service';
import { Delivery } from '../../+state/delivery.model';
import { DeliveryQuery } from '../../+state/delivery.query';

@Component({
  selector: 'delivery-editable',
  templateUrl: './delivery-editable.component.html',
  styleUrls: ['./delivery-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEditableComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'delivery-editable';

  public delivery$: Observable<Delivery>;
  public materials$: Observable<Material[]>;
  public movie$: Observable<Movie>;
  public opened = false;
  public pdfLink: string;

  public form = new MaterialForm();
  public activeForm$: Observable<FormEntity<MaterialControl>>;

  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private deliveryMaterialService: DeliveryMaterialService,
    private service: DeliveryService,
    private materialStore: MaterialStore,
    private daoService: DaoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private movieMaterialService: MovieMaterialService
  ) {}

  ngOnInit() {
    this.materials$ = combineLatest([
      this.query.selectActive(),
      this.materialQuery.selectAll()
    ]).pipe(
      filter(([delivery, materials]) => !!delivery),
      tap(([delivery, materials]) => {
        this.form.upsertValue(materials);
        // Disable or enable form depending on delivery isSigned property
        delivery.isSigned ? this.form.disable() : this.form.enable();
      }),
      switchMap(([delivery, materials]) => this.form.selectAll())
    );

    this.activeForm$ = this.form.selectActiveForm();

    this.pdfLink = `/delivery/contract.pdf?deliveryId=${this.query.getActiveId()}`;
    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
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
        ? this.deliveryMaterialService.updateDeliveryMaterials(materials)
        : this.movieMaterialService.updateMaterials(materials, delivery);
      this.snackBar.open('Material list updated !', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  /* Add a material formGroup to the form **/
  public addMaterial() {
    const newMaterial = this.deliveryMaterialService.createMaterial();
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
      ? this.deliveryMaterialService.updateDeliveryMaterialStatus(materials, status, delivery.id)
      : this.movieMaterialService.updateStatus(materials, status);
    this.snackBar.open(`Material status updated to ${status}`, 'close', { duration: 2000 });
    this.materialStore.returnToInitialState();
  }

  /* Switch isOrdered boolean value of selected materials **/
  public materialIsOrdered() {
    const materials = this.materialQuery.getActive();
    const delivery = this.query.getActive();
    delivery.mustBeSigned
      ? this.deliveryMaterialService.updateDeliveryMaterialIsOrdered(materials)
      : this.movieMaterialService.updateIsOrdered(materials);
    this.materialStore.returnToInitialState();
  }

  /* Switch isPaid boolean value of selected materials **/
  public materialsIsPaid() {
    const materials = this.materialQuery.getActive();
    const delivery = this.query.getActive();
    delivery.mustBeSigned
      ? this.deliveryMaterialService.updateDeliveryMaterialIsPaid(materials)
      : this.movieMaterialService.updateIsPaid(materials);
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
        ? this.deliveryMaterialService.deleteDeliveryMaterial(materialId)
        : this.movieMaterialService.delete(materialId, delivery);
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
    this.router.navigate([`../../list`], { relativeTo: this.route });
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

    const deliveryHash = keccak256(jsonDelivery + jsonMaterials);
    const orgEthAddress = await this.daoService.getOrganizationEthAddress();
    const movieId = this.movieQuery.getValue().active;

    this.service.setSignDeliveryTx(orgEthAddress, delivery.id, deliveryHash, movieId);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public disableDelivery() {
    // No clue about what to do here
  }

  public get deliveryContractURL$(): Observable<string> {
    return this.delivery$.pipe(map(({ id }) => `/delivery/contract.pdf?deliveryId=${id}`));
  }
}
