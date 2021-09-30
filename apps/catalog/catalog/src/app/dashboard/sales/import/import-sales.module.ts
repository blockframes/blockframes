// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { ViewExtractedElementsModule } from '@blockframes/import';

// Components
import { ImportSalesContainerComponent } from './import-sales-container/import-sales-container.component';
import { ImportSpreadsheetComponent } from './import-spreadsheet/import-spreadsheet.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';


const routes: Routes = [
  {
    path: '',
    component: ImportSalesContainerComponent
  }
];

@NgModule({
  declarations: [
    ImportSalesContainerComponent,
    ImportSpreadsheetComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    HttpClientModule,
    RouterModule.forChild(routes),

    // Material
    MatIconModule,
    MatButtonModule,

    ViewExtractedElementsModule,
    ImageModule
  ]
})
export class ImportModule { }
