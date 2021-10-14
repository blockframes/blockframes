// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ImportSpreadsheetModule } from '@blockframes/import/import-spreadsheet/import-spreadsheet.module';
import { ViewExtractedElementsModule } from '@blockframes/import/view-extracted-elements/view-extracted-elements.module';

// Components
import { ContractImportComponent } from './import.component';


const routes = [{
  path: '',
  component: ContractImportComponent,
}];

@NgModule({
  declarations: [ContractImportComponent],
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

    // Routes
    RouterModule.forChild(routes)
  ]
})
export class ContractImportModule { }
