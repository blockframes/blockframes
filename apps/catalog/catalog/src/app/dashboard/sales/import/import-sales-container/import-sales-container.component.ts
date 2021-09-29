import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AuthQuery } from '@blockframes/auth/+state';
import { SpreadsheetImportEvent } from '../import-spreadsheet/import-spreadsheet.component';
import { ViewExtractedContractsComponent } from '@blockframes/import';

@Component({
  selector: 'import-sales-container',
  templateUrl: './import-sales-container.component.html',
  styleUrls: ['./import-sales-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSalesContainerComponent implements OnInit {

  @ViewChild('viewExtractedContractsComponent') viewExtractedContractsComponent: ViewExtractedContractsComponent;

  public importedFiles = false;
  public fileType: string;
  public isUserBlockframesAdmin = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private authQuery: AuthQuery,
  ) {
    this.dynTitle.setPageTitle('Import Sales')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  async next(importEvent: SpreadsheetImportEvent) {
    this.fileType = importEvent.fileType;
    this.cdRef.detectChanges();
    this.viewExtractedContractsComponent.format(importEvent.sheet);
  }

  back() {
    this.fileType = undefined;
    this.cdRef.markForCheck();
  }

}
