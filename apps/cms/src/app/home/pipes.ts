import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ParamMap } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { QueryParameters } from 'algoliasearch';
import { map } from 'rxjs/operators';

function getOrgQueryFn(app: string) {
  const accepted = ['status', '==', 'accepted'];
  const appAccess = [`appAccess.${app}.dashboard`, '==', true];
  return ref => ref.where(...accepted).where(...appAccess);
}

function getTitlesQueryFn(app: string) {
  const accepted = ['storeConfig.status', '==', 'accepted'];
  const appAccess = [`storeConfig.appAccess.${app}`, '==', true];
  return ref => ref.where(...accepted).where(...appAccess);
}

function getOrgTitlesQueryFn(app: string, orgId: string) {
  const accepted = ['storeConfig.status', '==', 'accepted'];
  const appAccess = [`storeConfig.appAccess.${app}`, '==', true];
  const fromOrg = ['orgIds', 'array-contains', orgId];
  return ref => ref.where(...accepted).where(...appAccess).where(...fromOrg);
}

function toMap<T extends { id: string }>(list: T[]) {
  const record: Record<string, T> = {};
  for (const item of list) {
    record[item.id] = item;
  }
  return record;
}

@Pipe({ name: 'getParams' })
export class GetParams implements PipeTransform {
  transform(params: ParamMap, key: string) {
    return params.get(key);
  }
}

@Pipe({ name: 'getTitles' })
export class GetTitlesPipe implements PipeTransform {
  constructor(private service: MovieService) {}
  async transform(app: string) {
    console.log('app', app);
    const queryFn = getTitlesQueryFn(app);
    const orgs = await this.service.getValue(queryFn);
    return toMap(orgs);
  }
}


@Pipe({ name: 'getOrgs' })
export class GetOrgsPipe implements PipeTransform {
  constructor(private service: OrganizationService) {}
  async transform(app: string) {
    const queryFn = getOrgQueryFn(app);
    const orgs = await this.service.getValue(queryFn);
    return toMap(orgs);
  }
}

@Pipe({ name: 'getOrgTitles' })
export class GetOrgTitlesPipe implements PipeTransform {
  constructor(private service: MovieService){}
  transform(orgId: string, app: string) {
    if (!orgId) return;
    const queryFn = getOrgTitlesQueryFn(app, orgId);
    return this.service.valueChanges(queryFn).pipe(
      map(toMap)
    );
  }
}

@NgModule({
  declarations: [GetParams, GetTitlesPipe, GetOrgsPipe, GetOrgTitlesPipe],
  exports: [GetParams, GetTitlesPipe, GetOrgsPipe, GetOrgTitlesPipe]
})
export class HomePipesModule {}