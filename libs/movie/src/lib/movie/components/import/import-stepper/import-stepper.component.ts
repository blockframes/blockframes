import { Component, ViewChild } from '@angular/core';
import { SheetTab } from '@blockframes/utils';
import { ViewExtractedElementsComponent } from '../view-extracted-elements/view-extracted-elements.component';

@Component({
  selector: 'movie-import-stepper',
  templateUrl: './import-stepper.component.html',
  styleUrls: ['./import-stepper.component.scss'],
})
export class ImportStepperComponent {

  @ViewChild('viewExtractedElementsComponent', { static: true }) viewExtractedElementsComponent: ViewExtractedElementsComponent;

  constructor() {}

  next($event: { sheet: SheetTab, fileType: string}) {
    if($event.fileType === 'movies') {
      this.viewExtractedElementsComponent.formatMovies($event.sheet)
    } else {
      this.viewExtractedElementsComponent.formatAvailabilities($event.sheet)
    }
  }

}
