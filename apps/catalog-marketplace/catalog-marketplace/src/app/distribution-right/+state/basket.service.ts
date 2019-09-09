import { BasketQuery } from './basket.query';
import { FireQuery } from '@blockframes/utils';
import { Injectable } from '@angular/core';
import {
  CatalogBasket,
  DistributionRight,
  createBasket
} from './basket.model';
import { OrganizationQuery } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })
export class BasketService {
  constructor(
    private db: FireQuery,
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery
  ) {}

  public addBasket(catalogBasket: CatalogBasket) {
    const id = this.db.createId();
    const orgId = this.organizationQuery.id;
    const newBasket: CatalogBasket = createBasket({
      id,
      orgId,
      ...catalogBasket
    });
    this.db.doc<CatalogBasket>(`baskets/${id}`).set(newBasket);
  }

  createDistributionRight(right: Partial<DistributionRight> = {}) {
    return {
      id: this.db.createId(),
      movieId: right.movieId,
      medias: right.medias,
      languages: right.languages,
      dubbings: right.dubbings,
      subtitles: right.subtitles,
      duration: {
        from: right.duration.from,
        to: right.duration.to
      },
      territories: right.territories
    };
  }

  /*   public removeRight(id: string) {
    const rightsToRemove: CatalogBasket[] = this.organizationQuery
      .getValue()
      .org.catalog.filter(catalog => catalog.rights.id !== id);
    this.db
      .doc<Organization>(`orgs/${this.organizationQuery.getValue().org.id}/`)
      .update({ catalog: rightsToRemove });
  } */
}
