import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Template } from '../../template/+state/template.model';
import { MatDialogRef } from '@angular/material';
import { TemplateService } from '../../template/+state/template.service';
import { TemplateQuery } from '../../template/+state/template.query';
import { TemplateStore } from '../../template/+state/template.store';
import { MaterialService } from '../../material/+state/material.service';
import { Router } from '@angular/router';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryService } from '../../delivery/+state/delivery.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-template-picker',
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatePickerComponent implements OnInit, OnDestroy {
  private isAlive = true;
  public movieId = this.movieQuery.getActiveId();
  public templates$: Observable<Template[]>;

  constructor(
    private dialogRef: MatDialogRef<TemplatePickerComponent>,
    private service: TemplateService,
    private deliveryService: DeliveryService,
    private materialService: MaterialService,
    private templateStore: TemplateStore,
    private movieQuery: MovieQuery,
    private query: TemplateQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.materialService
      .subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();


    this.templates$ = this.query.selectAll();
  }

  public async createDelivery(templateId?: string) {
    this.close();
    if (!!templateId) {
      this.templateStore.setActive(templateId);
    }

    const deliveryId = await this.deliveryService.addDelivery(templateId);
    this.router.navigate([`layout/${this.movieId}/${deliveryId}/settings`]);
  }

  public async useMovieAsTemplate(){
    this.close();
    const deliveryId = await this.deliveryService.addMovieMaterialsDelivery();
    this.router.navigate([`layout/${this.movieId}/${deliveryId}/settings`]);
  }

  public close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
