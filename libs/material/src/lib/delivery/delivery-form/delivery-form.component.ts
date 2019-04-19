import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateView } from '../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewTemplateComponent } from '../delivery-new-template/new-template.component';
import { Material, MaterialDeliveryForm } from '../../material/+state/material.model';
import { MaterialStore, MaterialQuery, MaterialService } from '../../material/+state';
import { DeliveryService } from '../+state/delivery.service';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MovieQuery, Movie } from '@blockframes/movie';
import { DeliveryQuery } from '../+state';
import { ConfirmComponent } from '@blockframes/ui';

@Component({
  selector: 'delivery-form',
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryFormComponent implements OnInit, OnDestroy {
  public delivery$: Observable<TemplateView>;
  public movie$: Observable<Movie>;
  public form$: Observable<MaterialDeliveryForm>;
  public isDeliveryValidated$: Observable<boolean>;
  public isAlive = true;

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
    this.service.suscribeOnDeliveriesByActiveMovie().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.materialService.subscribeOnDeliveryMaterials$().pipe(takeWhile(() => this.isAlive)).subscribe();

    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.materialQuery.materialsByDelivery$;
    this.isDeliveryValidated$ = this.query.isDeliveryValidated$;
    this.form$ = this.materialQuery.deliveryForm$;

    this.isDeliveryValidated$.pipe(takeWhile(() => this.isAlive))
    .subscribe(isDeliveryValidated => isDeliveryValidated? this.materialStore.clearForm() : false)
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
    this.snackBar.open('Deleted material "' + material.value + '".', 'close', { duration: 2000 });
  }

  public addForm(category: string) {
    this.materialStore.updateEmptyDeliveryForm(category);
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
    this.router.navigate([`/layout/${this.movieQuery.getActiveId()}`]);
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

  ngOnDestroy() {
    this.isAlive = false;
  }
}
