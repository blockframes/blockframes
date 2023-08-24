import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  Inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Movie, App } from '@blockframes/model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouteDescription } from '@blockframes/model';
import { FileListPreviewComponent } from '@blockframes/media/file/preview-list/preview-list.component';
import { MatDialog } from '@angular/material/dialog';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { map, switchMap, tap } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { APP } from '@blockframes/utils/routes/utils';

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

  gtSm$ = this.breakpoint.gtSm;

  constructor(
    private dialog: MatDialog,
    private movie: MovieService,
    public route: ActivatedRoute,
    public router: Router,
    private analytics: AnalyticsService,
    private breakpoint: BreakpointsService,
    @Inject(APP) public currentApp: App
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

  fullscreen(title: Movie, index: number) {
    const refs = title.promotional.still_photo;
    this.promotionalElementOpened(title);

    this.dialog.open(FileListPreviewComponent, {
      data: createModalData({ refs, index }, 'large'),
      autoFocus: false
    });
  }

  hasPublicVideos(movie: Movie) {
    const hasPublicOtherVideo = movie.promotional.videos.otherVideo?.privacy === 'public' && !!movie.promotional.videos.otherVideo?.storagePath;
    const hasPublicScreener = this.currentApp === 'catalog' && !!movie.promotional.videos.publicScreener?.storagePath; 
    return hasPublicOtherVideo || hasPublicScreener;
  }

  videoStateChanged(title: Movie, event: string) {
    if (event === 'play' && !this.alreadyPlayed) {
      this.promotionalElementOpened(title);
      this.alreadyPlayed = true;
    }
  }

  promotionalElementOpened(title: Movie) {
    this.analytics.addTitle('promoElementOpened', title);
  }
}
