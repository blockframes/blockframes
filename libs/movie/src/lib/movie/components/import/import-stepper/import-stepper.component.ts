import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ViewExtractedElementsComponent } from '../view-extracted-elements/view-extracted-elements.component';
import { SpreadsheetImportEvent } from '../import-spreadsheet/import-spreadsheet.component';

@Component({
  selector: 'movie-import-stepper',
  templateUrl: './import-stepper.component.html',
  styleUrls: ['./import-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportStepperComponent {

  @ViewChild('viewExtractedElementsComponent', { static: true }) viewExtractedElementsComponent: ViewExtractedElementsComponent;

  constructor() {}

  async next(importEvent : SpreadsheetImportEvent) {
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

}
