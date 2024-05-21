// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

// Libraries
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { ViewExtractedElementsModule } from '../view-extracted-elements/view-extracted-elements.module';

// Components
import { ImportSpreadsheetComponent } from './import-spreadsheet.component';


@NgModule({
  declarations: [ ImportSpreadsheetComponent ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    // Material
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,

    // Libraries
    ImageModule,
    DownloadPipeModule,
    ViewExtractedElementsModule,
  ],
  exports: [ ImportSpreadsheetComponent ]
})
export class ImportSpreadsheetModule { }
