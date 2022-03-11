import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { QueryConstraint, where, orderBy } from 'firebase/firestore';
import { ParamMap } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';


export function getOrgsQueryFn(app: string): QueryConstraint[] {
  const accepted = where('status', '==', 'accepted');
  const appAccess = where(`appAccess.${app}.dashboard`, '==', true);
  return [accepted, appAccess];
}

export function getTitlesQueryFn(app: string): QueryConstraint[] {
  const accepted = where(`app.${app}.status`, '==', 'accepted');
  const appAccess = where(`app.${app}.access`, '==', true);
  return [accepted, appAccess];
}

export function getOrgTitlesQueryFn(app: string, orgId: string): QueryConstraint[] {
  const accepted = where(`app.${app}.status`, '==', 'accepted');
  const appAccess = where(`app.${app}.access`, '==', true);
  const fromOrg = where('orgIds', 'array-contains', orgId);
  return [accepted, appAccess, fromOrg];
}

export function getEventsQueryFn(): QueryConstraint[] {
  return [
    where('type', '==', 'screening'),
    where('isSecret', '==', false),
    orderBy('end')
  ];
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
  constructor(private service: MovieService) { }
  async transform(app: string) {
    const queryFn = getTitlesQueryFn(app);
    const orgs = await this.service.getValue(queryFn);
    return toMap(orgs);
  }
}


@Pipe({ name: 'getOrgs' })
export class GetOrgsPipe implements PipeTransform {
  constructor(private service: OrganizationService) { }
  async transform(app: string) {
    const queryFn = getOrgsQueryFn(app);
    const orgs = await this.service.getValue(queryFn);
    return toMap(orgs);
  }
}

@Pipe({ name: 'getOrgTitles' })
export class GetOrgTitlesPipe implements PipeTransform {
  constructor(private service: MovieService) { }
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
export class HomePipesModule { }
