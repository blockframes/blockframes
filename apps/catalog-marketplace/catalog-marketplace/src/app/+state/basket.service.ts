import { Injectable } from '@angular/core';
import { BasketQuery } from './basket.query';
import { OrganizationService } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })
export class BasketService {

  constructor(
    private organizationService: OrganizationService,
    private query: BasketQuery,
  ) {}

  update() {
    const catalog = this.query.getBasket();
    this.organizationService.update({ catalog });
  }
}
