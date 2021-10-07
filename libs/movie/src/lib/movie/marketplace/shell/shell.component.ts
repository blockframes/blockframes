import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, } from 'rxjs';
import { createMovie, Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { FileListPreviewComponent } from '@blockframes/media/file/preview-list/preview-list.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'title-marketplace-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleMarketplaceShellComponent implements OnInit {
  public movie$: Observable<Movie>;
  public navClicked = false;

  @Input() routes: RouteDescription[];
  @ViewChild('main') main: ElementRef<HTMLDivElement>;

  constructor(
    private dialog: MatDialog,
    private movieQuery: MovieQuery,
    public router: Router,
    public routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive().pipe(
      map(movie => {
        let title = createMovie(movie);
        if (movie.promotional.videos?.otherVideos) {
          title.promotional.videos.otherVideos = title.promotional.videos.otherVideos.filter(video => video.privacy === 'public');
        }
        return title;
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
    this.dialog.open(FileListPreviewComponent, { data: { refs, index }, width: '80vw', height: '80vh', autoFocus: false })
  }
}
