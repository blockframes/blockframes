import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContextMenuStore, ContextMenuState } from './context-menu.store';
import { ContextMenu, MenuItem } from './context-menu.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { switchMap, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuQuery extends QueryEntity<ContextMenuState, ContextMenu> {

  constructor(
    protected store: ContextMenuStore,
    private routerQuery: RouterQuery
  ) {
    super(store);
  }
  
  get menu$(): Observable<any> {
    return this.routerQuery.select(router => router.state)
    .pipe(
      switchMap((snapshot) => {

        // replace param values by param keys
        let menuKey = snapshot.url;
        Object.keys(snapshot.root.params).forEach((paramKey) => {
          menuKey = menuKey.replace(snapshot.root.params[paramKey],`:${paramKey}`);
        });

        // try to find best route match
        let candidate = '';
        this.getValue().ids.forEach((id: string) => {
          if(menuKey.indexOf(id) === 0 && candidate.length < id.length) {
            candidate = id;
          }
        });

        const menuId = candidate !== '' ? candidate: 'default';
        return this.applyParams(this.hasEntity(menuId)? menuId : 'default', snapshot);
      }))
  }

  private applyParams (menuId: string, snapshot: RouterStateSnapshot) {
    return this.selectEntity(menuId).pipe(
      map(menu => {
        const items = menu.items.map(item => {
          const i = { ...item } as MenuItem;
          // replace param kays by param values
          Object.keys(snapshot.root.params).forEach((paramKey) => {
            i.path = i.path.replace(`:${paramKey}`, snapshot.root.params[paramKey]);
          });
          return i;
        });

        return items;
      })
    )
  }
}
