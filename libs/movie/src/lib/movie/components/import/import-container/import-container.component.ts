import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { SpreadsheetImportEvent } from '../import-spreadsheet/import-spreadsheet.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ViewExtractedMoviesComponent } from '../view-extracted-elements/movies/view-extracted-movies.component';
import { ViewExtractedContractsComponent } from '../view-extracted-elements/contract/view-extracted-contracts.component';
import { ViewExtractedRightsComponent } from '../view-extracted-elements/rights/view-extracted-rights.component';
import { ViewExtractedOrganizationsComponent } from '../view-extracted-elements/organizations/view-extracted-organizations.component';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'movie-import-container',
  templateUrl: './import-container.component.html',
  styleUrls: ['./import-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContainerComponent implements OnInit {

  @ViewChild('viewExtractedMoviesComponent') viewExtractedMoviesComponent: ViewExtractedMoviesComponent;
  @ViewChild('viewExtractedContractsComponent') viewExtractedContractsComponent: ViewExtractedContractsComponent;
  @ViewChild('viewExtractedRightsComponent') viewExtractedRightsComponent: ViewExtractedRightsComponent;
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
