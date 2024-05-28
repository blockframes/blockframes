import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { startWith, map, tap, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie, StoreStatus } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  filter = new UntypedFormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  titles$ = this.service.queryDashboard('festival').pipe(
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  result$ = combineLatest([this.filter$, this.titles$]).pipe(
    map(([status, titles]) =>
      titles.filter((title) => {
        if (status) return title.app.festival.status === status;
        return title.app.festival.status !== 'archived';
      })
    )
  );

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(
    map((m) => ({
      all: m.filter((m) => m.app.festival.status !== 'archived').length,
      draft: m.filter((m) => m.app.festival.status === 'draft').length,
      accepted: m.filter((m) => m.app.festival.status === 'accepted').length,
      archived: m.filter((m) => m.app.festival.status === 'archived').length,
    }))
  );

  exporting = false;

  constructor(
    private service: MovieService,
    private pdfService: PdfService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
  }

  resetFilter() {
    this.filter.reset();
  }

  async export(movies: Movie[]) {
    const titleIds = movies.filter(m => m.app.festival.status === 'accepted').map(m => m.id);
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
