import { Pipe, PipeTransform } from '@angular/core';
import { CollectionReference, QueryFn } from '@angular/fire/firestore';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';

@Pipe({ name: 'queryTitles' })
export class HomeQueryTitlesPipe implements PipeTransform {
  constructor(private service: MovieService) {}
  transform(section: any) {
    if (section.query?.length) {
      const queryFn: QueryFn = ref => section.query.reduce((query: CollectionReference, params) => {
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
      return this.service.valueChanges(queryFn);
    } else {
      console.log(section.titleIds);
      return this.service.valueChanges(section.titleIds);
    }
  }
}


@Pipe({ name: 'queryOrgs' })
export class HomeQueryOrgsPipe implements PipeTransform {
  constructor(private service: OrganizationService) {}
  transform(section: any) {
    if (section.query) {
      const queryFn: QueryFn = ref => section.query.reduce((query: CollectionReference, params) => {
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
      return this.service.valueChanges(queryFn);
    } else {
      return this.service.valueChanges(section.orgIds);
    }
  }
}