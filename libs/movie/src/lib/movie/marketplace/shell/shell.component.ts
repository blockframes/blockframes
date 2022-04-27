import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageFile, Movie } from '@blockframes/model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { FileListPreviewComponent } from '@blockframes/media/file/preview-list/preview-list.component';
import { MatDialog } from '@angular/material/dialog';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { map, switchMap, tap } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from '@blockframes/movie/+state/movie.service';

@Component({
  selector: 'title-marketplace-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleMarketplaceShellComponent implements OnInit {
  public movie$: Observable<Movie>;
  public navClicked = false;
  private alreadyPlayed = false;

  @Input() routes: RouteDescription[];
  @ViewChild('main') main: ElementRef<HTMLDivElement>;

  constructor(
    private dialog: MatDialog,
    private movie: MovieService,
    private route: ActivatedRoute,
    public router: Router,
    private analytics: AnalyticsService,
  ) { }

  ngOnInit() {
    this.movie$ = this.route.params.pipe(
      map((params) => params.movieId),
      switchMap((id: string) => this.movie.valueChanges(id)),
      tap(() => {
        if (this.route.snapshot.fragment === 'trailer') {
          setTimeout(() => {
            const element = document.getElementById('videoFooter');
            if (element) scrollIntoView(element);
          }, 400);
        }
      })
    );
  }

  scrollIntoView() {
    /* We don't want to trigger the animation when the user just arrived on the page */
    if (this.navClicked) {
      scrollIntoView(this.main.nativeElement);
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  fullscreen(refs: StorageFile[], index: number) {
    this.dialog.open(FileListPreviewComponent, {
      data: { refs, index, style: 'large' },
      autoFocus: false,
    });
  }

  hasPublicVideos(movie: Movie) {
    return movie.promotional.videos.otherVideos.some((video) => video.privacy === 'public');
  }

  videoStateChanged(title: Movie, event: string) {
    if (event === 'play' && !this.alreadyPlayed) {
      this.analytics.addTitle('promoReelOpened', title);
      this.alreadyPlayed = true;
    }
  }
}
