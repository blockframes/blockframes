import { Injectable } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, combineLatest, map, takeWhile, tap } from 'rxjs/operators';
import { NotificationStore } from './notification.store';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(
    private orgQuery: OrganizationQuery,
    private fireQuery: FireQuery,
    private store: NotificationStore,
    ) {}

  public get orgNotificationList() {
    return this.orgQuery.selectAll().pipe(
      switchMap(orgs => {
        const notifications$ = orgs.map(org => {
          return this.fireQuery.fromQuery(this.getNotificationsByOrgIds(org.id))
        });
        return notifications$;
      }),
      tap((notifications: Notification[]) => this.store.set(notifications))
    )
  }

  private getNotificationsByOrgIds(orgId: string): Query<Notification[]> {
    return <Query<Notification[]>> {
      path: `notifications`,
      queryFn: ref => ref.where('orgId', '==', orgId),
    };
  }
}
