import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Observable, } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { FileListPreviewComponent } from '@blockframes/media/file/preview-list/preview-list.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { map, switchMap } from 'rxjs/operators';
import { MovieService } from '@blockframes/movie/+state';

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
    private movie: MovieService,
    private route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit() {
    this.movie$ = this.route.params.pipe(
      map(params => params.movieId),
      switchMap((id: string) => this.movie.valueChanges(id))
    )
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
