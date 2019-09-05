import { Organization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';
import { Injectable } from '@angular/core';
import { DistributionRight, BasketStatus, Price, CatalogBasket } from './basket.model';
import { OrganizationQuery } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })
export class BasketService {
  constructor(private db: FireQuery, private organizationQuery: OrganizationQuery) {
  }

  public add(distributionRight: DistributionRight) {
    // check if the default value has already been set
    if (this.organizationQuery.getValue().org.catalog === null) {
      this.db.doc<Organization>(`orgs/${this.organizationQuery.getValue().org.id}/`).update({
        catalog: {
          price: {
            amount: 0,
            currency: 'us-dollar'
          },
          status: BasketStatus.pending,
          rights: [distributionRight]
        }
      });
    } else {
      const newDistributionRight = [...this.organizationQuery.getValue().org.catalog.rights, distributionRight];
      this.db.doc<Organization>(`orgs/${this.organizationQuery.getValue().org.id}/`).update({
        catalog: {
          price: this.organizationQuery.getValue().org.catalog.price,
          status: this.organizationQuery.getValue().org.catalog.status,
          rights: newDistributionRight
        }
      });
    }
  }

  public addBid(price: Price) {
    const updatedCatalog: CatalogBasket = {
      price: { amount: price.amount, currency: price.currency },
      status: this.organizationQuery.getValue().org.catalog.status,
      rights: this.organizationQuery.getValue().org.catalog.rights
    };
    this.db.doc<Organization>(`orgs/${this.organizationQuery.getValue().org.id}/`).update({ catalog: updatedCatalog });
  }

  public removeRight(id: string) {
    const updatedCatalog: CatalogBasket = {
      price: this.organizationQuery.getValue().org.catalog.price,
      status: this.organizationQuery.getValue().org.catalog.status,
      rights: this.organizationQuery.getValue().org.catalog.rights.filter(right => right.id !== id)
    };
    this.db.doc<Organization>(`orgs/${this.organizationQuery.getValue().org.id}/`).update({ catalog: updatedCatalog });
  }
}
