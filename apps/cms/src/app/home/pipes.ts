import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { QueryFn } from '@angular/fire/firestore';
import { ParamMap } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';

export function getOrgsQueryFn(app: string): QueryFn {
  const accepted = ['status', '==', 'accepted'] as const;
  const appAccess = [`appAccess.${app}.dashboard`, '==', true] as const;
  return ref => ref.where(...accepted).where(...appAccess);
}

export function getTitlesQueryFn(app: string): QueryFn {
  const accepted = [`app.${app}.status`, '==', 'accepted'] as const;
  const appAccess = [`app.${app}.access`, '==', true] as const;
  return ref => ref.where(...accepted).where(...appAccess);
}

export function getOrgTitlesQueryFn(app: string, orgId: string): QueryFn {
  const accepted = [`app.${app}.status`, '==', 'accepted'] as const;
  const appAccess = [`app.${app}.access`, '==', true] as const;
  const fromOrg = ['orgIds', 'array-contains', orgId] as const;
  return ref => ref.where(...accepted).where(...appAccess).where(...fromOrg);
}

export function getEventsQueryFn(): QueryFn {
  return ref => ref
    .where('type', '==', 'screening')
    .where('isSecret', '==', false)
    .orderBy('end')
}

export function toMap<T extends { id: string }>(list: T[]) {
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
    const queryFn = getTitlesQueryFn(app);
    const orgs = await this.service.getValue(queryFn);
    return toMap(orgs);
  }
}


@Pipe({ name: 'getOrgs' })
export class GetOrgsPipe implements PipeTransform {
  constructor(private service: OrganizationService) {}
  async transform(app: string) {
    const queryFn = getOrgsQueryFn(app);
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
