import { ChangeDetectionStrategy, Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery, Delivery } from '../../+state';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { Observable} from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { Movie } from '@blockframes/movie';

@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'delivery-list';
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public userOrganization$: Observable<Organization>;
  public deliveries$: Observable<Delivery[]>;
  public movie$: Observable<Movie>;

  constructor(
    private query: DeliveryQuery,
    private organizationQuery: OrganizationQuery,
    private movieQuery: MovieQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.userOrganization$ = this.organizationQuery.select('org');
    this.deliveries$ = this.query.selectAll();
    this.movie$ = this.movieQuery.selectActive();
  }

  /**
   * Navigates directly to second step of delivery creation flow as we already are on a movie
   */
  public addDelivery() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/2-choose-starter`]);
  }
}
