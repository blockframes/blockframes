// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';

// Libraries
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { MovieDisplayModule } from '../../components/movie-display/movie-display.module';

// Components
import { ImportSpreadsheetComponent } from './import-spreadsheet/import-spreadsheet.component';
import { ImportStepperComponent } from './import-stepper/import-stepper.component';
import { PreviewSheetComponent } from './preview-sheet/preview-sheet.component';
import { PreviewMovieComponent } from './preview-movie/preview-movie.component';
import { ViewExtractedElementsComponent } from './view-extracted-elements/view-extracted-elements.component';
import { TableExtractedMoviesComponent } from './table-extracted-movies/table-extracted-movies.component';
import { MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatExpansionModule, MatSelectModule } from '@angular/material';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';
import { TableExtractedAvailabilitiesComponent } from './table-extracted-availabilities/table-extracted-availabilities.component';

@NgModule({
  declarations: [
    ImportStepperComponent,
    ImportSpreadsheetComponent,
    ViewExtractedElementsComponent,
    TableExtractedMoviesComponent,
    TableExtractedAvailabilitiesComponent,
    PreviewSheetComponent,
    PreviewMovieComponent,
    ViewImportErrorsComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    MatStepperModule,
    MatExpansionModule,
    MatSelectModule,

    // Librairies
    UploadModule,
    UiFormModule,
    MovieDisplayModule,
  ],
  providers: [ ],
  entryComponents: [
    PreviewSheetComponent,
    PreviewMovieComponent,
    ViewImportErrorsComponent
  ],
  exports: [],
})
export class ImportMovieModule {}
