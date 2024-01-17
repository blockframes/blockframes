// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

// Pipes
import { ErrorCountPipeModule } from '../pipes/error-count.pipe';
import { IsDisabledPipeModule } from '../pipes/is-disabled.pipe';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';

// Components
import { TableExtractedContractsComponent } from './contracts/contracts.component';
import { TableExtractedMoviesComponent } from './movies/movies.component';
import { TableExtractedOrganizationsComponent } from './organizations/organizations.component';
import { TableExtractedDocumentsComponent } from './documents/documents.component';
import { TableExtractedSourcesComponent } from './sources/sources.component';
import { TableExtractedRightsComponent } from './rights/rights.component';
import { TableExtractedStatementsComponent } from './statements/statements.component';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';

@NgModule({
  declarations: [
    TableExtractedMoviesComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
    TableExtractedDocumentsComponent,
    TableExtractedSourcesComponent,
    TableExtractedRightsComponent,
    TableExtractedStatementsComponent,
    ViewImportErrorsComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GlobalModalModule,
    ClipboardModule,

    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,

    // Librairies
    ImageModule,
    ToLabelModule,
    ErrorCountPipeModule,
    IsDisabledPipeModule,
    GetTitlePipeModule

  ],
  exports: [
    TableExtractedMoviesComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
    TableExtractedDocumentsComponent,
    TableExtractedSourcesComponent,
    TableExtractedRightsComponent,
    TableExtractedStatementsComponent
  ],
})
export class TableExtractedElementsModule { }
