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
import { DeliveryQuery } from '../../delivery/+state';

@Component({
  selector: 'delivery-template-picker',
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatePickerComponent implements OnInit, OnDestroy {
  private isAlive = true;
  public templates$: Observable<Template[]>;

  constructor(
    private dialogRef: MatDialogRef<TemplatePickerComponent>,
    private service: TemplateService,
    private deliveryService: DeliveryService,
    private materialService: MaterialService,
    private templateStore: TemplateStore,
    private movieQuery: MovieQuery,
    private deliveryQuery: DeliveryQuery,
    private query: TemplateQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.materialService
      .subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.service.allTemplates().pipe(takeWhile(() => this.isAlive))
    .subscribe();

    this.templates$ = this.query.selectAll();
  }

  public createDelivery(templateId?: string, ) {
    const movieId = this.movieQuery.getActiveId();

    if (!!templateId) {
      this.templateStore.setActive(templateId);
    }

    this.deliveryService.addDelivery(templateId);
    this.router.navigate([`layout/${movieId}/${this.deliveryQuery.getActiveId()}/settings`]);
    this.close();
  }

  public async useMovieAsTemplate(){
    this.close();
    await this.deliveryService.addMovieMaterialsDelivery();
    this.router.navigate([`layout/${this.movieQuery.getActiveId()}/${this.deliveryQuery.getActiveId()}/settings`]);
  }

  public close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
