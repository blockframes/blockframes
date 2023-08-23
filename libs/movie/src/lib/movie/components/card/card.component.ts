import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() set queryParams(value: unknown) {
    if (value) {
      const formValue = JSON.stringify(value);
      const options = { queryParams: { formValue } }
      const tree = this.router.createUrlTree([], options);
      this._queryParams= tree.queryParams;
    }
  }
  public _queryParams : unknown;

  private _movie: Movie;
  get movie() {
    return this._movie;
  }
  @Input() set movie(value: Movie) {
    this._movie = parseMovie(value);
  }
  @Input() link: string | string[] = '..';

  constructor(
    private breakpointsService: BreakpointsService,
    private router: Router,
  ) { }

  get placeholderAsset() {
    return this.size === 'banner' ? 'empty_banner.png' : 'empty_poster.svg';
  }
}
