import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateView } from '../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewTemplateComponent } from '../delivery-new-template/new-template.component';
import { Material, MaterialForm } from '../../material/+state/material.model';
import { MaterialStore, MaterialQuery, MaterialService } from '../../material/+state';
import { DeliveryService } from '../+state/delivery.service';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie';
import { DeliveryQuery } from '../+state';

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
    this.delivery$ = this.materialQuery.materialsByDelivery$;

    this.form$ = this.materialQuery.form$;

    this.materialService.subscribeOnDeliveryMaterials$().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.service.subscribeOnActiveDelivery().pipe(takeWhile(() => this.isAlive)).subscribe();
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

  public deleteDelivery() {
    const movieId = this.movieQuery.getActiveId();
    this.service.deleteDelivery();
    this.router.navigate([`/layout/${movieId}`]);
    this.snackBar.open('Delivery deleted', 'close', { duration: 2000 });
    // TODO: fix behavior => user can still go back and land on the delivery page (without active delivery)
  }

  public goToSettings(){
    const deliveryId = this.query.getActiveId();
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/${movieId}/form/${deliveryId}/settings`]);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
