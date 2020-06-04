// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

// Libraries
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TermDateModule } from '@blockframes/utils/pipes/term-date.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.module';

// Components
import { TableExtractedContractsComponent } from './contracts/contracts.component';
import { TableExtractedRightsComponent } from './rights/rights.component';
import { TableExtractedMoviesComponent } from './movies/movies.component';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableExtractedOrganizationsComponent } from './organizations/organizations.component';

@NgModule({
  declarations: [
    TableExtractedMoviesComponent,
    TableExtractedRightsComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,

    // Librairies
    ImageReferenceModule,
    TermDateModule,
    ToLabelModule,
  ],
  exports: [
    TableExtractedMoviesComponent,
    TableExtractedRightsComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
  ],
})
export class TableExtractedElementsModule {}
