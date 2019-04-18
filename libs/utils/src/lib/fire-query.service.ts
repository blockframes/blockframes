import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export type Query<T> = {
  path: string;
  queryFn?: QueryFn;
} & {
  [K in keyof Partial<T>]: (...entity: T[]) => Query<TypeofArray<T[K]>> | Query<TypeofArray<T[K]>>[]
};

type TypeofArray<T> = T extends (infer X)[] ? X : T



@Injectable({ providedIn: 'root' })
export class FireQuery {
  private keysToRemove = ['path', 'queryFn'];

  constructor(private db: AngularFirestore) {}

  /** Make a query to firebase */
  public fromQuery<T>(query: Query<T>): Observable<T> {
    return this.fromSubQuery(query) as Observable<T>;
  }

  // Dispatch subquery to collection or list of doc
  private fromSubQuery<T>(query: Query<T> | Query<T>[]): Observable<T | T[]> {
    if (Array.isArray(query)) {
      return this.fromDocList(query);
    }
    // If path is event, this is a doc, else, this is a collection
    const isEven = query.path.split('/').length % 2 === 0;
    return isEven
      ? this.fromDoc(query)
      : this.fromCollection(query);
  }

  private fromCollection<T>(query: Query<T>): Observable<T[]> {
    const { path, queryFn } = query;
    // Select all entities
    return this.db
      .collection<T>(path, queryFn)
      .valueChanges()
      .pipe(
        switchMap((entities) => {
          if (!this.hasSubqueries(query)) {
            return of(entities);
          } else {
            // For Each entity populate with the subqueries
            const populatedEntities$ = entities.map(entity => {
              return this.getAllSubQueries(query, entity);
            });
            return combineLatest(populatedEntities$);
          }
        })
      );
  }

  /** Query a list of document */
  private fromDocList<T>(listOfDocQueries: Query<T>[]) {
    const allDocs$ = listOfDocQueries.map(query => this.fromDoc(query));
    return combineLatest(allDocs$);
  }

  /** Query a unique document */
  private fromDoc<T>(query: Query<T>) {
    return this.db
      .doc<T>(query.path)
      .valueChanges()
      .pipe(
        switchMap(entity => {
          if (!this.hasSubqueries(query)) {
            return of(entity);
          }
          return this.getAllSubQueries(query, entity);
        })
      );
  }

  /** Look for all subqueries in a query */
  private getAllSubQueries<T, K extends keyof T>(query: Query<T>, entity: T): Observable<T> {
    // Get all subquery keys
    const keys = Object.keys(query);
    const subQueryKeys = keys.filter(key => !this.keysToRemove.includes(key));
    // For each key get the subquery
    const subQueries$ = subQueryKeys.map(key => {
      const subQuery: Query<T[K]> | Query<T[K]>[] = query[key](entity);
      return this.fromSubQuery(subQuery).pipe(
        map(subentity => ({ key, subentity }))
      );
    });

    return combineLatest(subQueries$).pipe(
      // Add the content to the object
      map((subEntities) => subEntities.reduce((acc, {key, subentity}) => ({
        ...acc,
        [key]: subentity
      }), {})),
      map(subEntityObj => ({ ...entity, ...subEntityObj })),
    );
  }


  // HELPERS
  private hasSubqueries<T>(query: Query<T>) {
    const keys = Object.keys(query);
    const subQuery = keys.filter(key => !this.keysToRemove.includes(key));
    return subQuery.length > 0;
  }

  /** See example below

  public get deliveryList() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(id => this.fromQuery(this.getDeliveryListWithStakeholders(id)))
    );
  }

  private getDeliveryListWithStakeholders(movieId: string): Query<Delivery> {
    return {
      path: `deliveries`,
      queryFn: (ref) => ref.where('movieId', '==', movieId),
      stakeholders: (delivery: Delivery): Query<Stakeholder> => ({
        path: `deliveries/${delivery.id}/stakeholders`,
        organization: (stakeholder: Stakeholder): Query<Organization> => ({
          path: `orgs/${stakeholder.orgId}`
        })
      })
    }
  } */
}
