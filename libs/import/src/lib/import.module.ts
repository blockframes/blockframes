// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// Libraries
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { ViewExtractedElementsModule } from './components/view-extracted-elements/view-extracted-elements.module';

// Components
import { ImportContainerComponent } from './pages/import-container/import-container.component';
import { ImportSpreadsheetComponent } from './components/import-spreadsheet/import-spreadsheet.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Guards
import { MovieOrganizationListGuard } from '@blockframes/movie/guards/movie-organization-list.guard';


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
    ImportSpreadsheetComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),

    // Material
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,

    // Librairies
    FileUploaderModule,
    ViewExtractedElementsModule,
    ImageReferenceModule
  ]
})
export class ImportModule { }
