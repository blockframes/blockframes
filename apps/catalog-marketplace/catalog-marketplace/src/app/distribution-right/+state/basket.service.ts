import { Organization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';
import { Injectable } from '@angular/core';
import { DistributionRight, BasketStatus } from './basket.model';
import { OrganizationQuery } from '@blockframes/organization';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BasketService {
  constructor(private db: FireQuery, private organizationQuery: OrganizationQuery) {}

  public add(distributionRight: DistributionRight) {
    const organization = this.organizationQuery.getValue().org;
    const newDistributionRight = [...organization.catalog.rights, distributionRight];
    this.db.doc<Organization>(`orgs/${organization.id}/`).update({
      catalog: {
        price: { amount: 0, currency: 'us-dollar' },
        status: BasketStatus.pending,
        rights: newDistributionRight
      }
    });
  }
}
