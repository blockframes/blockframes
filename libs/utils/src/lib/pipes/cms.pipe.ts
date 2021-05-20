import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Query, QueryFn } from '@angular/fire/firestore';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { distinctUntilChanged } from 'rxjs/operators';

function getQueryFn(section): QueryFn {
  return (ref: Query) => section.query.reduce((query: Query, params) => {
    if (params.method === 'where') {
      return query.where(params.field, params.condition, params.value);
    }
    if (params.method === 'limit') {
      return query.limit(params.limit);
    }
    if (params.method === 'limitToLast') {
      return query.limitToLast(params.limit);
    }
    if (params.method === 'orderBy') {
      return query.orderBy(params.field, params.direction);
    }
  }, ref);
}

@Pipe({ name: 'queryTitles' })
export class HomeQueryTitlesPipe implements PipeTransform {
  constructor(private service: MovieService) {}
  transform(section: unknown) {
    if (section.query?.length) {
      return this.service.valueChanges(getQueryFn(section)).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    } else {
      return this.service.valueChanges(section.titleIds).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    }
  }
}

@Pipe({ name: 'queryOrgs' })
export class HomeQueryOrgsPipe implements PipeTransform {
  constructor(private service: OrganizationService) {}
  transform(section: unknown) {
    if (section.query?.length) {
      return this.service.valueChanges(getQueryFn(section)).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    } else {
      return this.service.valueChanges(section.orgIds).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    }
  }
}



@NgModule({
  declarations: [HomeQueryOrgsPipe, HomeQueryTitlesPipe],
  exports: [HomeQueryOrgsPipe, HomeQueryTitlesPipe]
})
export class CMSPipeModule{}
