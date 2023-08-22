import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '@blockframes/model';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

function parseMovie(movie: Movie): Movie {
  if (movie['objectID']) {
    return {
      ...movie,
      id: movie['objectID'],
    } as Movie;
  }
  return movie as Movie;
}

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  public hasOverlay = false;
  public placeholder: string;
  public ltLg$ = this.breakpointsService.ltLg;

  @Input() size: 'banner' | 'poster' | 'avatar';
  @Input() showWishlistButton = true;
  @Input() showMovieFeature = true;
  @Input() queryParams = {};

  private _movie: Movie;
  get movie() {
    return this._movie;
  }
  @Input() set movie(value: Movie) {
    this._movie = parseMovie(value);
  }
  @Input() link = '..';

  constructor(
    private breakpointsService: BreakpointsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  get placeholderAsset() {
    return this.size === 'banner' ? 'empty_banner.png' : 'empty_poster.svg';
  }

  navigate() {
    const formValue = JSON.stringify(this.queryParams);
    this.router.navigate([this.link], {
      queryParams: { formValue },
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
}
