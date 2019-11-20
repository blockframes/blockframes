import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { MovieDisplayModule } from '../../display/display.module';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module';

// Components
import { ImportSpreadsheetComponent } from './import-spreadsheet/import-spreadsheet.component';
import { ImportStepperComponent } from './import-stepper/import-stepper.component';
import { PreviewSheetComponent } from './preview-sheet/preview-sheet.component';
import { PreviewMovieComponent } from './preview-movie/preview-movie.component';
import { ViewExtractedElementsComponent } from './view-extracted-elements/view-extracted-elements.component';
import { TableExtractedMoviesComponent } from './table-extracted-movies/table-extracted-movies.component';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';
import { TableExtractedSalesComponent } from './table-extracted-sales/table-extracted-sales.component';
import { MovieOrganizationListGuard } from '../../guards/movie-organization-list.guard';

const routes: Routes = [
  {
    path: '',
    component: ImportStepperComponent,
    canActivate: [MovieOrganizationListGuard], // @todo #643 not working if user does not have at least one movie in his list
    canDeactivate: [MovieOrganizationListGuard],
  }
];

@NgModule({
  declarations: [
    ImportStepperComponent,
    ImportSpreadsheetComponent,
    ViewExtractedElementsComponent,
    TableExtractedMoviesComponent,
    TableExtractedSalesComponent,
    PreviewSheetComponent,
    PreviewMovieComponent,
    ViewImportErrorsComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

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
    MatProgressSpinnerModule,

    // Librairies
    UploadModule,
    UiFormModule,
    MovieDisplayModule,
    CropperModule,
  ],
  entryComponents: [
    PreviewSheetComponent,
    PreviewMovieComponent,
    ViewImportErrorsComponent
  ],
  exports: [],
})
export class ImportMovieModule {}
