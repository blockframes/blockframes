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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { PasswordConfirmModule } from '@blockframes/ui/form';
import { UploadModule } from '@blockframes/ui/upload';
import { MovieDisplayModule } from '../../display/display.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { TermToPrettyDateModule } from '@blockframes/utils/pipes/to-pretty-date.module';

// Components
import { ImportSpreadsheetComponent } from './import-spreadsheet/import-spreadsheet.component';
import { ImportContainerComponent } from './import-container/import-container.component';
import { PreviewSheetComponent } from './preview-sheet/preview-sheet.component';
import { ViewExtractedElementsComponent } from './view-extracted-elements/view-extracted-elements.component';
import { TableExtractedMoviesComponent } from './table-extracted-movies/table-extracted-movies.component';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';
import { TableExtractedDealsComponent } from './table-extracted-deals/table-extracted-deals.component';
import { MovieOrganizationListGuard } from '../../guards/movie-organization-list.guard';
import { TableExtractedContractsComponent } from './table-extracted-contracts/table-extracted-contracts.component';

const routes: Routes = [
  {
    path: '',
    component: ImportContainerComponent,
    canActivate: [MovieOrganizationListGuard],
    canDeactivate: [MovieOrganizationListGuard],
  }
];

@NgModule({
  declarations: [
    ImportContainerComponent,
    ImportSpreadsheetComponent,
    ViewExtractedElementsComponent,
    TableExtractedMoviesComponent,
    TableExtractedDealsComponent,
    TableExtractedContractsComponent,
    PreviewSheetComponent,
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
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,

    // Librairies
    UploadModule,
    PasswordConfirmModule,
    MovieDisplayModule,
    CropperModule,
    ImageReferenceModule,
    ImgAssetModule,
    TermToPrettyDateModule,
  ],
  entryComponents: [
    PreviewSheetComponent,
    ViewImportErrorsComponent
  ],
  exports: [],
})
export class ImportMovieModule {}
