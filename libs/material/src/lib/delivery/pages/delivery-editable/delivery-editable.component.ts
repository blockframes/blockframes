import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewTemplateComponent } from '../../components/delivery-new-template/new-template.component';
import { Material, MaterialService } from '../../../material/+state';
import { MaterialQuery } from '../../../material/+state';
import { DeliveryService } from '../../+state/delivery.service';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery, Delivery, Step } from '../../+state';
import { ConfirmComponent } from '@blockframes/ui';
import { map, startWith, tap, switchMap, filter } from 'rxjs/operators';
import { createMaterialFormList } from '../../forms/material.form';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'delivery-editable',
  templateUrl: './delivery-editable.component.html',
  styleUrls: ['./delivery-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEditableComponent implements OnInit {
  public delivery$: Observable<Delivery>;
  public materials$: Observable<Material[]>;
  public steps$: Observable<Step[]>;
  public movie$: Observable<Movie>;
  public opened = false;

  public materialsFormList = createMaterialFormList();
  public materialFormGroup$: Observable<FormGroup>;
  /** Observable of the selected memberId */
  private selectedMaterialId$ = new BehaviorSubject<string>(null);

  constructor(
    private materialQuery: MaterialQuery,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private materialService: MaterialService,
    private service: DeliveryService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.materials$ = this.materialQuery.selectAll().pipe(
      tap(materials => this.materialsFormList.patchValue(materials)),
      switchMap(materials => this.materialsFormList.valueChanges.pipe(startWith(materials)))
    );

    /** Return the materialFormGroup linked to the selected materialId */
    this.materialFormGroup$ = this.selectedMaterialId$.pipe(
      filter((materialId) => !!materialId),
      map((materialId) => this.materialsFormList.value.findIndex(material => material.id === materialId)),
      // Maybe a filter for index > -1
      map(index => this.materialsFormList.at(index))
    );

    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
    this.steps$ = this.query.steps$;
  }

  public openSidenav(materialId: string) {
    this.selectedMaterialId$.next(materialId);
    this.opened = true;

  }

  public async update() {
    try {
      const deliveryId = this.query.getActiveId();
      this.materialService.updateMaterials(this.materialsFormList.value, deliveryId);
      this.snackBar.open('Material updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addMaterial() {
    // Blank sidenav. User have to click again on new material edit icon to show inputs => ISSUE#760
    const materialId = this.service.addMaterial();
    this.openSidenav(materialId);
  }

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
      const deliveryId = this.query.getActiveId();
      this.service.deleteMaterial(materialId, deliveryId);
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
        onConfirm: () => this.unsealDelivery()
      }
    });
  }

  private unsealDelivery() {
    this.service.unsealDelivery();
    this.snackBar.open('Delivery unsealed', 'close', { duration: 2000 });
  }

  public signDelivery() {
    // this.service.signDelivery();
  }

  public get deliveryContractURL$(): Observable<string> {
    return this.delivery$.pipe(map(({ id }) => `/delivery/contract.pdf?deliveryId=${id}`));
  }
}
