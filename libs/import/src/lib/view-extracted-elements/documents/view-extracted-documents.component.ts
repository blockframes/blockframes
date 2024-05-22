import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { AuthService } from '@blockframes/auth/service';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { formatDocument } from './utils';
import { DocumentsImportState } from '../../utils';
import { TermService } from '@blockframes/contract/term/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

@Component({
  selector: 'import-view-extracted-documents[sheetTab]',
  templateUrl: './view-extracted-documents.component.html',
  styleUrls: ['./view-extracted-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedDocumentsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public documentsToCreate$ = new BehaviorSubject<MatTableDataSource<DocumentsImportState>>(null);

  constructor(
    private authService: AuthService,
    private titleService: MovieService,
    private waterfallService: WaterfallService,
    private termsService: TermService,
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private waterfallDocumentsService: WaterfallDocumentsService
  ) {
    this.dynTitle.setPageTitle('Submit your documents');
  }

  async ngOnInit() {
    const documentsToCreate = await formatDocument(
      this.sheetTab,
      this.orgService,
      this.titleService,
      this.waterfallService,
      this.waterfallDocumentsService,
      this.termsService,
      this.authService.profile.orgId,
    );
    this.documentsToCreate$.next(new MatTableDataSource(documentsToCreate));
  }
}
