import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Ip, IpStore, IpQuery } from '../+state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IpResolver implements Resolve<Ip> {

  constructor(private query: IpQuery) {}

  resolve(route: ActivatedRouteSnapshot): Ip {
    return this.query.getEntity(route.params['id']);
  }
}
