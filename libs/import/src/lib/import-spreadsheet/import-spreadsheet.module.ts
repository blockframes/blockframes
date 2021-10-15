// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

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
