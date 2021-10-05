// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { ImportSpreadsheetModule } from './import-spreadsheet/import-spreadsheet.module';
import { ViewExtractedElementsModule } from './view-extracted-elements/view-extracted-elements.module';

// Components
import { ImportContainerComponent } from './import.component';


@NgModule({
  declarations: [ ImportContainerComponent ],
  imports: [
    CommonModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Libraries
    ImportSpreadsheetModule,
    ViewExtractedElementsModule,

  ], exports: [ ImportContainerComponent ],
})
export class ImportModule { }
