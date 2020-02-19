import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ViewExtractedElementsComponent } from '../view-extracted-elements/view-extracted-elements.component';
import { SpreadsheetImportEvent } from '../import-spreadsheet/import-spreadsheet.component';

@Component({
  selector: 'movie-import-container',
  templateUrl: './import-container.component.html',
  styleUrls: ['./import-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContainerComponent {

  @ViewChild('viewExtractedElementsComponent', { static: false }) viewExtractedElementsComponent: ViewExtractedElementsComponent;

  public importedFiles = false;
  public start = true;

  constructor(private cdRef: ChangeDetectorRef) { }

  async next(importEvent: SpreadsheetImportEvent) {
    this.start = false;
    this.cdRef.detectChanges();

    switch (importEvent.fileType) {
      case 'movies':
        this.viewExtractedElementsComponent.formatMovies(importEvent.sheet);
        break;
      case 'deals':
        this.viewExtractedElementsComponent.formatDistributionDeals(importEvent.sheet);
        break;
      case 'contracts':
        await this.viewExtractedElementsComponent.formatContracts(importEvent.sheet);
        break;
      default:
        break;
    }
  }

  back() {
    this.start = true;
    this.cdRef.markForCheck();
  }

}
