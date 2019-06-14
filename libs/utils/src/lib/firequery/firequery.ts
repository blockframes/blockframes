import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import {
  Query,
  QueryLike,
  QueryInput,
  QueryOutput,
  isQueryLike,
  createQuery,
  initializeOwnerDocRights,
  initializeSharedDocRights,
  BFDoc
} from './types';

@Injectable({ providedIn: 'root' })
export class FireQuery extends AngularFirestore {
  private keysToRemove = ['path', 'queryFn'];

  //////////////
  // SNAPSHOT //
  //////////////

  /** Return the current value of the path from Firestore */
  public async snapshot<T>(path: string): Promise<T> {
    // If path targets a collection ( odd number of segments after the split )
    if (path.split('/').length % 2 !== 0) {
      const snapshot = await this.collection(path).ref.get();
      return snapshot.docs.map(doc => doc.data()) as any; // TODO: fix typing (doc.data() as T)
      // Else path targets a doc
    } else {
      const snapshot = await this.doc(path).ref.get();
      return snapshot.data() as any; // TODO: fix typing (doc.data() as T)
    }
  }

  ////////////////
  // OBSERVABLE //
  ////////////////

  /** Make a query to firebase */
  public fromQuery<T>(query: Query<T>[]): Observable<T[]>;
  public fromQuery<T>(query: string | Query<T>): Observable<T>;
  public fromQuery<T, Q extends QueryInput<T>>(query: Q): QueryOutput<Q, T> {
    return isQueryLike(query)
      ? (this.fromSubQuery(query as QueryLike<T>) as any)
      : this.fromSubQuery(createQuery<T>(query as string));
  }

  // Dispatch subquery to collection or list of doc
  private fromSubQuery<T>(query: QueryLike<T>): Observable<T> | Observable<T[]> {
    if (!query) return throwError(`Query failed`);
    if (Array.isArray(query)) {
      return this.fromDocList(query);
    }
    // If path is event, this is a doc, else, this is a collection
    const isEven = query.path.split('/').length % 2 === 0;
    return isEven ? this.fromDoc(query) : this.fromCollection(query);
  }

  private fromCollection<T>(query: Query<T>): Observable<T[]> {
    const { path, queryFn } = query;
    // Select all entities
    return this.collection<T>(path, queryFn)
      .valueChanges()
      .pipe(
        switchMap(entities => {
          if (!entities) return throwError(`Nothing found at path : ${query.path}`);
          if (!entities.length) return of([]);
          if (!this.hasSubqueries(query)) return of(entities);
          // For Each entity populate with the subqueries
          const populatedEntities$ = entities.map(entity => {
            return this.getAllSubQueries(query, entity);
          });
          return combineLatest(populatedEntities$);
        })
      );
  }

  /** Query a list of document */
  private fromDocList<T>(listOfDocQueries: Query<T>[]) {
    if (!listOfDocQueries.length) return of([]);
    const allDocs$ = listOfDocQueries.map(query => this.fromDoc(query));
    return combineLatest(allDocs$);
  }

  /** Query a unique document */
  private fromDoc<T>(query: Query<T>) {
    return this.doc<T>(query.path)
      .valueChanges()
      .pipe(
        switchMap(entity => {
          if (!entity) return throwError(`Nothing found at path : ${query.path}`);
          return this.hasSubqueries(query) ? this.getAllSubQueries(query, entity) : of(entity);
        })
      );
  }

  /** Look for all subqueries in a query */
  private getAllSubQueries<T>(query: Query<T>, entity: T): Observable<T> {
    // Get all subquery keys
    const keys = Object.keys(query);
    const subQueryKeys = keys.filter(key => !this.keysToRemove.includes(key));
    // For each key get the subquery
    const subQueries$ = subQueryKeys.map(key => {
      const subEntity$ =
        typeof query[key] === 'function' ? this.fromSubQuery(query[key](entity)) : of(query[key]);
      return subEntity$.pipe(map(subentity => ({ key, subentity })));
    });

    return combineLatest(subQueries$).pipe(
      // Add the content to the object
      map(subEntities =>
        subEntities.reduce(
          (acc, { key, subentity }) => ({
            ...acc,
            [key]: subentity
          }),
          {}
        )
      ),
      map(subEntityObj => ({ ...entity, ...subEntityObj }))
    );
  }

  // HELPERS
  private hasSubqueries<T>(query: Query<T>) {
    const keys = Object.keys(query);
    const subQuery = keys.filter(key => !this.keysToRemove.includes(key));
    return subQuery.length > 0;
  }

  //////////////////////
  // DOC TRANSACTIONS //
  //////////////////////

  /** Create a transaction for the document and add document rights (organization document rights and shared document rights) at the same time */
  public async createAndSetRights<T>(
    document: BFDoc,
    orgId: string
  ) {
    const promises = [];
    const orgDocRights = initializeOwnerDocRights(document.id);
    const sharedDocRights = initializeSharedDocRights(document.id);

    return this.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDocRightsRef = this.doc<any>(`rights/${orgId}/docs/${document.id}`).ref;
      promises.push(tx.set(orgDocRightsRef, orgDocRights));

      const sharedDocRightsRef = this.doc<any>(
        `rights/${orgId}/apps/${document._type}Rights/docRights/${document.id}`
      ).ref;
      promises.push(tx.set(sharedDocRightsRef, sharedDocRights));

      const documentRef = this.doc<T>(`${document._type}/${document.id}`).ref;
      promises.push(tx.set(documentRef, document));

      return Promise.all(promises);
    });
  }
}
