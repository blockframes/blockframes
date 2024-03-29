import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { StoreStatus, storeStatus, Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleListComponent {
  filter = new UntypedFormControl();
  filter$: Observable<StoreStatus | ''> = this.filter.valueChanges.pipe(
    startWith(this.filter.value || '')
  );

  movies$ = this.service.queryDashboard('catalog').pipe(
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  result$ = combineLatest([this.filter$, this.movies$]).pipe(
    map(([status, movies]) =>
      movies.filter((movie) => {
        if (status) return movie.app.catalog.status === status;
        return movie.app.catalog.status !== 'archived';
      })
    )
  );

  movieCount$ = this.movies$.pipe(
    map((m) => ({
      all: m.filter((m) => m.app.catalog.status !== 'archived').length,
      draft: m.filter((m) => m.app.catalog.status === 'draft').length,
      submitted: m.filter((m) => m.app.catalog.status === 'submitted').length,
      accepted: m.filter((m) => m.app.catalog.status === 'accepted').length,
      archived: m.filter((m) => m.app.catalog.status === 'archived').length,
    }))
  );

  exporting = false;

  constructor(
    private service: MovieService,
    private pdfService: PdfService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter]);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.useDefault();
  }

  async export(movies: Movie[]) {
    const titleIds = movies.filter(m => m.app.catalog.status === 'accepted').map(m => m.id);
    const downloadSettings: DownloadSettings = { titleIds, orgId: this.orgService.org.id };
    const canDownload = this.pdfService.canDownload(downloadSettings);

    if (!canDownload.status) {
      this.snackbar.open(canDownload.message, 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    this.cdr.markForCheck();
    const exportStatus = await this.pdfService.download(downloadSettings);
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
    this.cdr.markForCheck();
  }
}
