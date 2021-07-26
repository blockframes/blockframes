// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  ViewEncapsulation,
  HostBinding,
  OnInit,
  OnDestroy
} from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { Event, EventService } from '@blockframes/event/+state';

function createMovieView(movie: Movie) {
  return {
    directors: movie.directors,
    title: {
      original: movie.title.original,
      international: movie.title.international
    },
    banner: movie.banner,
    poster: movie.poster,
  }
}

type MovieHeaderView = ReturnType<typeof createMovieView>

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  public movieView: MovieHeaderView;
  public screeningOngoing = false;
  public eventId: string;
  public sub: Subscription;
  private _movie: Movie;

  constructor(private location: Location, private eventService: EventService) { }

  @Input() showBackArrow = true;
  @Input() set movie(movie: Movie) {
    if (movie) {
      this._movie = movie;
      this.movieView = createMovieView(movie);
    }
  }

  get movie() { return this._movie }

  ngOnInit() {
    const q = ref => ref
      .where('isSecret', '==', false)
      .where('meta.titleId', '==', this.movie.id)
      .where('type', '==', 'screening');

    const events$ = this.eventService.queryByType(['screening'], q);
    this.sub = events$.subscribe(screenings => {
      screenings.sort(this.sortByDate);
      this.eventId = screenings[0].id;
      return screenings[0].start <= new Date() && new Date() <= screenings[0].end
        ? this.screeningOngoing = true
        : this.screeningOngoing = false;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.back();
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }
}

@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderActions {
  @HostBinding('class') class = 'movie-header-actions'
}

@Directive({
  selector: 'movie-header-cta, [movieHeaderCTA]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderCTA {
  @HostBinding('class') class = 'movie-header-cta'
}

@Directive({
  selector: 'movie-header-preferences, [movieHeaderPreferences]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderPreferences {
  @HostBinding('class') class = 'movie-header-preferences'
}
