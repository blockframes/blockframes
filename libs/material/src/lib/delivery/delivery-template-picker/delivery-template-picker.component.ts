import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Template, TemplateStore, TemplateQuery } from '../../template/+state';
import { DeliveryService } from '../+state';
import { MovieQuery } from '@blockframes/movie';
import { Router } from '@angular/router';

@Component({
  selector: 'material-delivery-template-picker',
  templateUrl: './delivery-template-picker.component.html',
  styleUrls: ['./delivery-template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTemplatePickerComponent implements OnInit {

  public movieId = this.movieQuery.getActiveId();
  public templates$: Observable<Template[]>;

  constructor(
    private deliveryService: DeliveryService,
    private templateStore: TemplateStore,
    private movieQuery: MovieQuery,
    private query: TemplateQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.templates$ = this.query.selectAll();
  }

  public async createDelivery(templateId?: string) {

    if (!!templateId) {
      this.templateStore.setActive(templateId);
    }

    const deliveryId = await this.deliveryService.addDelivery(templateId);
    this.router.navigate([`layout/${this.movieId}/${deliveryId}/settings`]);
  }

  public async useMovieAsTemplate() {
    const deliveryId = await this.deliveryService.addDeliveryWithMovieMaterials();
    this.router.navigate([`layout/${this.movieId}/${deliveryId}/settings`]);
  }

}
