import { ChangeDetectionStrategy, Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { Observable} from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { Delivery } from '../../+state/delivery.model';
import { DeliveryQuery } from '../../+state/delivery.query';

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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userOrganization$ = this.organizationQuery.selectActive();
    this.deliveries$ = this.query.selectAll();
    this.movie$ = this.movieQuery.selectActive();
  }

  /**
   * Navigates directly to second step of delivery creation flow as we already are on a movie
   */
  public addDelivery() {
    // TODO: We are redirected by DeliveryActiveGuard here, will be fixed with akita-ng-fire version of it => ISSUE #1334
    // this.router.navigate(['../2-choose-starter'], { relativeTo: this.route });

    // Temporary route
    this.router.navigate([`/layout/o/delivery/movie/add/1-find-movie`]);
  }
}
