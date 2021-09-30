// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { ImportSpreadsheetModule } from './import-spreadsheet/import-spreadsheet.module';
import { ViewExtractedElementsModule } from './view-extracted-elements/view-extracted-elements.module';

// Components
import { ImportContainerComponent } from './import.component';


const routes: Routes = [
  {
    path: '',
    component: ImportContainerComponent
  }
];

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

    RouterModule.forChild(routes),
  ]
})
export class ImportModule { }
