import { Organization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';
import { Injectable } from '@angular/core';
import { CatalogBasket } from './basket.model';
import { OrganizationQuery } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })
export class BasketService {
  constructor(private db: FireQuery, private organizationQuery: OrganizationQuery) {}

  public add(basket: CatalogBasket) {
    const organization = this.organizationQuery.getValue().org;
      this.db.doc<Organization>(`orgs/${organization.id}`).update({ catalog: basket });
  }
}
