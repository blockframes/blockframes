import { Observable, Subscription } from "rxjs";
import { Router, UrlTree, CanActivate, CanDeactivate, ActivatedRouteSnapshot } from "@angular/router";
import { tap } from "rxjs/operators";
import { EntityStore, applyTransaction } from "@datorama/akita";

export abstract class StateListGuard<T> implements CanActivate, CanDeactivate<any> {

  abstract query: Observable<T[]>;
  abstract urlFallback: string;
  private subscription: Subscription;

  constructor(protected store: EntityStore<any, T>, protected router: Router) {}

  canActivate(): Promise<boolean | UrlTree> {
    return new Promise((res, rej) => {
      this.subscription = this.query.pipe(
        tap(entities => this.store.set(entities))
      ).subscribe({
        next: result => {
          return typeof result === 'string'
            ? res(this.router.parseUrl(result))
            : res(!!result);
        },
        error: err => {
          console.log(err)
          return res(this.router.parseUrl(this.urlFallback))
        }
      })
    })
  }

  canDeactivate(): boolean {
    this.subscription.unsubscribe();
    return true;
  }
}

export abstract class StateActiveGuard<T> implements CanActivate, CanDeactivate<any> {
  /** Specify the names of the params to check,
   *  should be same name as the route params
   */
  abstract params: string[];
  abstract urlFallback: string;
  private subscription: Subscription;

  constructor(
    protected store: EntityStore<any, T>,
    protected router: Router,
  ) {}

  abstract query(params: object): Observable<T>

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> | UrlTree {
    const keys = Object.keys(route.params);
    const paramNotFound = this.params.find(param => !keys.includes(param));
    if (paramNotFound) {
      console.error(`Parameter ${paramNotFound} has not been found`);
      return this.router.parseUrl(this.urlFallback);
    }

    return new Promise((res, rej) => {
      this.subscription = this.query(route.params).pipe(
        tap(entity => applyTransaction(() => {
          this.store.upsert(entity[this.store.idKey], entity);
          this.store.setActive(entity[this.store.idKey]);
        }))
      ).subscribe({
        next: result => {
          return typeof result === 'string'
            ? res(this.router.parseUrl(result))
            : res(!!result);
        },
        error: err => {
          console.log(err)
          return res(this.router.parseUrl(this.urlFallback))
        }
      });
    })
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
