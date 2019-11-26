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

  next(importEvent : SpreadsheetImportEvent) {
    importEvent.fileType === 'movies' ?
      this.viewExtractedElementsComponent.formatMovies(importEvent.sheet) :
      this.viewExtractedElementsComponent.formatDistributionDeals(importEvent.sheet);
  }

}
