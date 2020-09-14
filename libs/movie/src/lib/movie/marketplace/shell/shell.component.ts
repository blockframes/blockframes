import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'marketplace-movie-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieShellComponent implements OnInit {
  @HostBinding('@scaleIn') animPage;
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;

  navLinks = [{
    path: 'main',
    label: 'Main Information'
  },
  {
    path: 'screenings',
    label: 'Upcoming Screenings'
  }
  ];

  promoLinks = [
    'promo_reel_link',
    'scenario',
    'screener_link',
    'teaser_link',
    'presentation_deck',
    'trailer_link'
  ];

  public isEnoughPicturesThen(min: number) {
    return this.movieQuery.selectActive().pipe(
      map(movie => Object.values(movie.promotional.still_photo).length > min)
    );
  }

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    public router: Router,
    public routerQuery: RouterQuery,
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', movieId)))
    );
  }
}

@Directive({
  selector: 'movie-header, [movieHeader]',
  host: { class: 'movie-header' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeader { }
