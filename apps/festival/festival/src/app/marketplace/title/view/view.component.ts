import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

const promoLinks = [
  'promo_reel_link',
  'scenario',
  'screener_link',
  'teaser_link',
  'presentation_deck',
  'trailer_link'
];

@Component({
  selector: 'festival-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
  @HostBinding('@scaleIn') animPage;
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;
  public promoLinks = promoLinks;

  navLinks = [
    {
      path: 'main',
      label: 'Main Information'
    }
  ];

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery
      .selectActiveId()
      .pipe(
        switchMap(movieId =>
          this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', movieId))
        )
      );
  }

  public hasLink({ promotionalElements }: Movie): boolean {
    return this.promoLinks.some(link => !!promotionalElements[link].media.url);
  }

  public getLinks(movie: Movie) {
    return promoLinks.map(link => {
      if (movie.promotionalElements[link].media.url) {
        const isDownload = link === 'scenario' || link === 'presentation_deck';
        return {
          url: movie.promotionalElements[link].media.url,
          icon: isDownload ? 'download' : 'play',
          label: isDownload
            ? `Download ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
            : `Watch ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
        };
      }
    }).filter(link => link);
  }
}
