import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { StoreStatus, storeStatus, Person, Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';
import { displayPerson } from '@blockframes/utils/pipes';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { filters } from '@blockframes/ui/list/table/filters';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleListComponent {
  filter = new FormControl();
  filter$: Observable<StoreStatus | ''> = this.filter.valueChanges.pipe(
    startWith(this.filter.value || '')
  );
  filters = filters;

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
      all: m.filter((m) => m.app.festival.status !== 'archived').length,
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

  openDetails(title: string, values: Person[]) {
    this.dialog.open(CellModalComponent, {
      data: createModalData({ title, values: displayPerson(values) }),
      autoFocus: false
    });
  }

  async export(movies: Movie[]) {
    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    this.cdr.markForCheck();
    await this.pdfService.download({ titleIds: movies.map(m => m.id), orgId: this.orgService.org.id });
    snackbarRef.dismiss();
    this.exporting = false;
    this.cdr.markForCheck();
  }
}
