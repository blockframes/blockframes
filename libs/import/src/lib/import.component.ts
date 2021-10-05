
import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Input } from '@angular/core';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { SpreadsheetImportEvent, SpreadsheetImportType } from './utils';
import { ViewExtractedMoviesComponent } from './view-extracted-elements/movies/view-extracted-movies.component';
import { ViewExtractedContractsComponent } from './view-extracted-elements/contract/view-extracted-contracts.component';
import { ViewExtractedOrganizationsComponent } from './view-extracted-elements/organizations/view-extracted-organizations.component';

@Component({
  selector: '[importType] import-container',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContainerComponent implements OnInit {

  @Input() importType: SpreadsheetImportType;

  @ViewChild('viewExtractedComponent') viewExtractedComponent: ViewExtractedMoviesComponent |ViewExtractedContractsComponent | ViewExtractedOrganizationsComponent;

  public fileType: string;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('Submit your titles');
  }

  ngOnInit() {
    this.cdRef.markForCheck();
  }

  async next(importEvent: SpreadsheetImportEvent) {
    this.fileType = importEvent.importType;
    this.cdRef.detectChanges();

    this.viewExtractedComponent.format(importEvent.sheet);
  }

  back() {
    this.fileType = undefined;
    this.cdRef.markForCheck();
  }

}
