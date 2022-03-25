// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  ViewEncapsulation,
  HostBinding,
  OnInit,
  OnDestroy,
} from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/model';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NavigationService } from '@blockframes/ui/navigation.service'

function createMovieView(movie: Movie) {
  return {
    id: movie.id,
    directors: movie.directors,
    title: {
      original: movie.title.original,
      international: movie.title.international,
    },
    banner: movie.banner,
    poster: movie.poster,
  };
}

type MovieHeaderView = ReturnType<typeof createMovieView>;

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  public movieView: MovieHeaderView;
  private _movie: Movie;
  private countRouteEvents = 1;
  private sub: Subscription;

  constructor(private router: Router, private navService: NavigationService) {}

  @Input() showBackArrow = true;
  @Input() set movie(movie: Movie) {
    if (movie) {
      this._movie = movie;
      this.movieView = createMovieView(movie);
    }
  }

  get movie() {
    return this._movie;
  }

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((evt: Event) => evt instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.navService.goBack();
  }
}

@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderActions {
  @HostBinding('class') class = 'movie-header-actions';
}

@Directive({
  selector: 'movie-header-cta, [movieHeaderCTA]',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderCTA {
  @HostBinding('class') class = 'movie-header-cta';
}

@Directive({
  selector: 'movie-header-preferences, [movieHeaderPreferences]',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderPreferences {
  @HostBinding('class') class = 'movie-header-preferences';
}
