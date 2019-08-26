import { FireQuery } from '@blockframes/utils';
import { Injectable } from '@angular/core';
import { DistributionRight } from './basket.model';
import { OrganizationQuery } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })
export class BasketService {

  constructor(private db: FireQuery, private organizationQuery: OrganizationQuery) {}

  public createDistributionRight(distributionRight: DistributionRight){
    const organizationId = this.organizationQuery.getValue();
    this.db.doc<DistributionRight>(`orgs/${organizationId}/distributionRight/`).set(distributionRight);
  }

}
