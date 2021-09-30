import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { SpreadsheetImportEvent, ViewExtractedContractsComponent } from '@blockframes/import';

@Component({
  selector: 'import-sales-container',
  templateUrl: './import-sales-container.component.html',
  styleUrls: ['./import-sales-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSalesContainerComponent implements OnInit {

  @ViewChild('viewExtractedContractsComponent') viewExtractedContractsComponent: ViewExtractedContractsComponent;

  public fileImported: boolean;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('Import Sales')
  }

  ngOnInit() {
    this.cdRef.markForCheck();
  }

  async next(importEvent: SpreadsheetImportEvent) {
    this.fileImported = !!importEvent;
    this.cdRef.detectChanges();
    this.viewExtractedContractsComponent.format(importEvent.sheet);
  }

  back() {
    this.fileImported = false;
    this.cdRef.markForCheck();
  }

}
