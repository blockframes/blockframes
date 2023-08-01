import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie, App } from '@blockframes/model';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { MovieService } from '@blockframes/movie/service';
import { APP } from '@blockframes/utils/routes/utils';
import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';

@Component({
  selector: 'marketplace-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  // The table needs to be updated when user deletes a movie
  changeDetection: ChangeDetectionStrategy.Default,
})
export class WishlistComponent implements OnInit, OnDestroy {
  public dataSource: MatTableDataSource<Movie>;
  public hasWishlist: boolean;
  public columnsToDisplay = [
    'movie',
    'director',
    'productionStatus',
    'originCountry',
    'runningTime',
    'delete',
  ];

  private sub: Subscription;
  public isDataLoaded = false;
  public exporting = false;
  public movieIds: string[] = [];

  constructor(
    private router: Router,
    private service: OrganizationService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private movieService: MovieService,
    private pdfService: PdfService,
    @Inject(APP) private app: App
  ) { }

  ngOnInit() {
    this.sub = this.orgService.currentOrg$
      .pipe(switchMap((org) => this.movieService.valueChanges(org?.wishlist || [])))
      .subscribe((allMovies) => {
        const movies = allMovies.filter((movie) => !!movie && movie.app[this.app].access);
        this.hasWishlist = !!movies.length;
        this.hasWishlist
          ? this.dynTitle.setPageTitle('Wishlist')
          : this.dynTitle.setPageTitle('Wishlist', 'Empty');
        this.dataSource = new MatTableDataSource(movies);
        this.movieIds = movies.map(m => m.id);
        this.isDataLoaded = true;
        this.cdr.markForCheck();
      });
  }

  public async redirectToMovie(movieId: string) {
    this.router.navigate(['../title', movieId], { relativeTo: this.route });
  }

  public remove(movie: Movie, event: Event) {
    event.stopPropagation();
    this.service.updateWishlist(movie);
    const title = movie.title.international;
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', {
      duration: 2000,
    });
  }

  public clear(event: Event) {
    event.stopPropagation();
    this.service.clearWishlist(this.dataSource.filteredData);
    this.snackbar.open('All titles have been removed from your selection.', 'close', {
      duration: 3000,
    });
  }

  async export() {
    const downloadSettings: DownloadSettings = { titleIds: this.movieIds };
    const canDownload = this.pdfService.canDownload(downloadSettings);

    if (!canDownload.status) {
      this.snackbar.open(canDownload.message, 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    const exportStatus = await this.pdfService.download(downloadSettings);
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
