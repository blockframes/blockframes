// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ImportSpreadsheetModule } from '@blockframes/import/import-spreadsheet/import-spreadsheet.module';
import { ViewExtractedElementsModule } from '@blockframes/import/view-extracted-elements/view-extracted-elements.module';

// Components
import { SourceImportComponent } from './import.component';


@NgModule({
  declarations: [SourceImportComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    ImageModule,
    ImportSpreadsheetModule,
    ViewExtractedElementsModule,

    // Material
    MatIconModule,
    MatButtonModule,

  ],
  exports: [SourceImportComponent],
})
export class SourceImportModule { }
