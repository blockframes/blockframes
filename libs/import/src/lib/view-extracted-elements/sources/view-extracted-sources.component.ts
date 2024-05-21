import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { SourcesImportState } from '../../utils';
import { formatSource } from './utils';
import { AuthService } from '@blockframes/auth/service';
import { MovieService } from '@blockframes/movie/service';

@Component({
  selector: 'import-view-extracted-sources[sheetTab]',
  templateUrl: './view-extracted-sources.component.html',
  styleUrls: ['./view-extracted-sources.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedSourcesComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public sourcesToCreate$ = new BehaviorSubject<MatTableDataSource<SourcesImportState>>(null);

  constructor(
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private authService: AuthService,
  ) {
    this.dynTitle.setPageTitle('Submit your sources');
  }

  async ngOnInit() {
    const sourcesToCreate = await formatSource(
      this.sheetTab,
      this.movieService,
      this.authService.profile.orgId,
    );
    this.sourcesToCreate$.next(new MatTableDataSource(sourcesToCreate));
  }
}
