import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RightsImportState } from '../../utils';
import { formatRight } from './utils';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';

@Component({
  selector: 'import-view-extracted-rights[sheetTab]',
  templateUrl: './view-extracted-rights.component.html',
  styleUrls: ['./view-extracted-rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedRightsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public rightsToCreate$ = new BehaviorSubject<MatTableDataSource<RightsImportState>>(null);

  constructor(
    private dynTitle: DynamicTitleService,
    private waterfallService: WaterfallService,
    private waterfallDocumentService: WaterfallDocumentsService,
    private movieService: MovieService,
    private authService: AuthService,
  ) {
    this.dynTitle.setPageTitle('Submit your rights');
  }

  async ngOnInit() {
    const rightsToCreate = await formatRight(
      this.sheetTab,
      this.waterfallService,
      this.movieService,
      this.waterfallDocumentService,
      this.authService.profile.orgId,
    );
    this.rightsToCreate$.next(new MatTableDataSource(rightsToCreate));
  }
}
