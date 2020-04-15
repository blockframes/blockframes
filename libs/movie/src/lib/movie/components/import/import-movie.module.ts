// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { UploadModule } from '@blockframes/ui/upload';
import { ViewExtractedElementsModule } from './view-extracted-elements/view-extracted-elements.module';

// Components
import { ImportSpreadsheetComponent } from './import-spreadsheet/import-spreadsheet.component';
import { ImportContainerComponent } from './import-container/import-container.component';

// Guards
import { MovieOrganizationListGuard } from '../../guards/movie-organization-list.guard';

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
    RouterModule.forChild(routes),

    // Material
    MatIconModule,
    MatButtonModule,


    // Librairies
    UploadModule,
    ViewExtractedElementsModule,
  ]
})
export class ImportMovieModule {}
