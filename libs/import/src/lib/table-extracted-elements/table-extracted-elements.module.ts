// Angular
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

// Libraries
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

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
    BfCommonModule,
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
