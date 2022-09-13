import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, map, tap, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie, Person, StoreStatus } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';
import { displayPerson } from '@blockframes/utils/pipes';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { filters } from '@blockframes/ui/list/table/filters';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  filter = new FormControl();
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

  filters = filters;

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
  }

  resetFilter() {
    this.filter.reset();
  }

  openDetails(title: string, values: Person[]) {
    this.dialog.open(CellModalComponent, {
      data: createModalData({ title, values: displayPerson(values) }),
      autoFocus: false
    });
  }

  async export(movies: Movie[]) {
    const titleIds = movies.map(m => m.id);
    if (titleIds.length >= this.pdfService.exportLimit) {
      this.snackbar.open('You can\'t have an export with that many titles.', 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    this.cdr.markForCheck();
    const exportStatus = await this.pdfService.download({ titleIds, orgId: this.orgService.org.id });
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
    this.cdr.markForCheck();
  }
}
