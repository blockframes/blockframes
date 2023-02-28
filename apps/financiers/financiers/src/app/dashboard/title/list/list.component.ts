import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fromOrg, MovieService } from '@blockframes/movie/service';
import { Movie, MovieCampaign } from '@blockframes/model';
import { CampaignService } from '@blockframes/campaign/service';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { filters } from '@blockframes/ui/list/table/filters';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';

type Filters = 'all' | 'draft' | 'ongoing' | 'achieved' | 'archived';

function filterMovieCampaign(movies: MovieCampaign[], filter: Filters) {
  switch (filter) {
    case 'all':
      return movies.filter((movie) => movie.app.financiers.status !== 'archived');
    case 'draft':
      return movies.filter((movie) => movie.app.financiers.status === 'draft');
    case 'ongoing':
      return movies.filter(
        (movie) =>
          movie.app.financiers.status === 'accepted' &&
          movie.campaign?.cap > movie.campaign?.received
      );
    case 'achieved':
      return movies.filter(
        (movie) =>
          movie.app.financiers.status === 'accepted' &&
          movie.campaign?.cap === movie.campaign?.received
      );
    case 'archived':
      return movies.filter((movie) => movie.app.financiers.status === 'archived');
  }
}

@Component({
  selector: 'financiers-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  titles$: Observable<MovieCampaign[]>;
  titleCount$: Observable<Record<string, number>>;
  filter = new FormControl('all');
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  filters = filters;
  exporting = false;

  constructor(
    private campaignService: CampaignService,
    private orgService: OrganizationService,
    private pdfService: PdfService,
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.titles$ = this.orgService.currentOrg$.pipe(
      switchMap((org) =>
        this.movieService
          .valueChanges(fromOrg(org.id))
          .pipe(map((movies) => movies.map((m) => m.id)))
      ),
      switchMap((movieIds) => this.campaignService.queryMoviesCampaign(movieIds)),
      map((movies) => movies.filter((movie) => movie.app.financiers.access)),
      switchMap((movies) =>
        this.filter$.pipe(map((filter) => filterMovieCampaign(movies, filter)))
      ),
      tap((movies) => {
        movies.length
          ? this.dynTitle.setPageTitle('My titles')
          : this.dynTitle.setPageTitle('My titles', 'Empty');
      })
    );

    this.titleCount$ = this.orgService.currentOrg$.pipe(
      switchMap((org) =>
        this.movieService
          .valueChanges(fromOrg(org.id))
          .pipe(map((movies) => movies.map((m) => m.id)))
      ),
      switchMap((movieIds) => this.campaignService.queryMoviesCampaign(movieIds)),
      map((movies) => movies.filter((movie) => movie.app.financiers.access)),
      map((m) => ({
        all: m.length,
        draft: m.filter((m) => m.app.financiers.status === 'draft').length,
        ongoing: m.filter(
          (m) => m.app.financiers.status === 'submitted' && m.campaign?.cap > m.campaign?.received
        ).length,
        achieved: m.filter(
          (m) => m.app.financiers.status === 'accepted' && m.campaign?.cap === m.campaign?.received
        ).length,
        archived: m.filter((m) => m.app.financiers.status === 'archived').length,
      }))
    );
  }

  public applyFilter(filter: Filters) {
    this.filter.setValue(filter);
  }

  public async export(movies: Movie[]) {
    const titleIds = movies.filter(m => m.app.financiers.status === 'accepted').map(m => m.id);
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
