import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { EventService } from '@blockframes/event/service';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { limit, limitToLast, orderBy, startAt, where } from 'firebase/firestore';
import { of, catchError, distinctUntilChanged } from 'rxjs';

function getQueryConstraints(section: { query: any[] }) {
  return section.query.map((params) => {
    if (params.method === 'where') {
      return where(params.field, params.condition, params.value);
    }
    if (params.method === 'limit') {
      return limit(params.limit);
    }
    if (params.method === 'limitToLast') {
      return limitToLast(params.limit);
    }
    if (params.method === 'orderBy') {
      return orderBy(params.field, params.direction);
    }
    if (params.method === 'startAt') {
      if (params.value === 'now') {
        return startAt(new Date());
      } else {
        return startAt(params.value);
      }
    }
  });
}

@Pipe({ name: 'queryTitles' })
export class HomeQueryTitlesPipe implements PipeTransform {
  constructor(private service: MovieService) { }
  transform(section: any) {
    if (section.query?.length) {
      return this.service.valueChanges(getQueryConstraints(section)).pipe(
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
  constructor(private service: OrganizationService) { }
  transform(section: any) {
    if (section.query?.length) {
      return this.service.valueChanges(getQueryConstraints(section)).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    } else {
      return this.service.valueChanges(section.orgIds).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        catchError(() => of(undefined))
      );
    }
  }
}

@Pipe({ name: 'queryEvents' })
export class HomeQueryEventsPipe implements PipeTransform {
  constructor(private service: EventService) { }
  transform(section: any) {
    if (section.query?.length) {
      return this.service.valueChanges(getQueryConstraints(section)).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    } else {
      return this.service.valueChanges(section.eventIds).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    }
  }
}


@NgModule({
  declarations: [HomeQueryOrgsPipe, HomeQueryTitlesPipe, HomeQueryEventsPipe],
  exports: [HomeQueryOrgsPipe, HomeQueryTitlesPipe, HomeQueryEventsPipe]
})
export class CMSPipeModule { }
