import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { SubcollectionService, CollectionConfig, syncQuery, Query } from 'akita-ng-fire';

const basketsQuery = (organizationId: string): Query<CatalogBasket> => ({
  path: `orgs/${organizationId}/baskets`,
  queryFn: ref => ref.where('status', '==', 'pending')
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/baskets' })
export class BasketService extends SubcollectionService<BasketState> {
  syncQuery = syncQuery.bind(this, basketsQuery(this.organizationQuery.getValue().org.id));

  constructor(
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery,
    store: BasketStore
  ) {
    super(store);
  }

  public addBasket(basket: CatalogBasket) {
    const id = this.db.createId();
    const newBasket: CatalogBasket = createBasket({
      id,
      price: { amount: 0, currency: 'euro' },
      rights: basket.rights
    });
    this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${id}`).set(newBasket);
  }

  public async updateWishlist(movie: Movie) {
    const organizations = [];
    await this.db
      .collection<Organization>('orgs')
      .get()
      .toPromise()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          const transformed = doc.data();
          organizations.push(transformed);
        });
      });
    let ownerOfMovie: Organization;
    organizations.forEach(org => {
      org.movieIds.forEach(id => {
        if (id === movie.id) {
          ownerOfMovie = org;
        }
      });
    });
    const id = this.db.createId();
    const wishlistFactory = () => {
      return {
        id: id,
        movie: movie.main.title.original,
        salesAgent: ownerOfMovie.name || '',
        director: movie.main.directors[0],
        status: movie.main.status,
        originCountry: getLabelByCode('TERRITORIES', movie.main.originCountries[0]),
        length: `${movie.main.length} min`
      };
    };
    this.db.doc(`orgs/${this.organizationQuery.id}/wishlist/${id}`).set(wishlistFactory());
  }

  public removeDistributionRight(rightId: string, basketId: string) {
    const findDistributionRight: DistributionRight[] = [];
    this.basketQuery.getAll().forEach(baskets =>
      baskets.rights.forEach(right => {
        if (right.id === rightId) {
          findDistributionRight.push(right);
        }
      })
    );
    // if there is only one distribution right in the basket, delete the basket
    if (findDistributionRight.length <= 1) {
      this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basketId}`).delete();
    } else {
      this.basketQuery.getAll().forEach(baskets =>
        baskets.rights.forEach(right => {
          if (right.id !== rightId) {
            this.db
              .doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basketId}`)
              .update(baskets);
          }
        })
      );
    }
  }

  public rewriteBasket(basket: CatalogBasket) {
    this.db
      .doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basket.id}`)
      .update(basket);
  }

  get createFireStoreId(): string {
    return this.db.createId();
  }
}
