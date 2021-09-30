import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AuthQuery } from '@blockframes/auth/+state';
import { ViewExtractedMoviesComponent } from './view-extracted-elements/movies/view-extracted-movies.component';
import { ViewExtractedContractsComponent } from './view-extracted-elements/contract/view-extracted-contracts.component';
import { ViewExtractedOrganizationsComponent } from './view-extracted-elements/organizations/view-extracted-organizations.component';
import { SpreadsheetImportEvent } from './import-spreadsheet/import-spreadsheet.component';

@Component({
  selector: 'import-container',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContainerComponent implements OnInit {

  @ViewChild('viewExtractedMoviesComponent') viewExtractedMoviesComponent: ViewExtractedMoviesComponent;
  @ViewChild('viewExtractedContractsComponent') viewExtractedContractsComponent: ViewExtractedContractsComponent;
  @ViewChild('viewExtractedOrganizationsComponent') viewExtractedOrganizationsComponent: ViewExtractedOrganizationsComponent;

  public importedFiles = false;
  public fileType: string;
  public isUserBlockframesAdmin = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private authQuery: AuthQuery,
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  async next(importEvent: SpreadsheetImportEvent) {
    this.fileType = importEvent.fileType;
    this.cdRef.detectChanges();

    const childViewName = `viewExtracted${importEvent.fileType[0].toUpperCase() + importEvent.fileType.substr(1).toLowerCase()}Component`;
    this[childViewName].format(importEvent.sheet);
  }

  back() {
    this.fileType = undefined;
    this.cdRef.markForCheck();
  }

}
