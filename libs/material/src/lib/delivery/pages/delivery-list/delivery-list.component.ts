import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery, Delivery } from '../../+state';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public userOrganization$: Observable<Organization>;
  public dataSource: MatTableDataSource<Delivery>;
  public displayedColumns: string[] = ['stakeholders', 'state'];
  private destroyed$ = new Subject();

  constructor(
    private query: DeliveryQuery,
    private organizationQuery: OrganizationQuery,
    private movieQuery: MovieQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.userOrganization$ = this.organizationQuery.select('org');
    this.query
      .selectAll()
      .pipe(
        takeUntil(this.destroyed$),
        map(deliveries => this.dataSource = new MatTableDataSource(deliveries))
      )
      .subscribe();
    this.dataSource.sort = this.sort;
  }

  /**
   * Navigates directly to second step of delivery creation flow as we already are on a movie
   */
  public addDelivery() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/2-choose-starter`]);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
