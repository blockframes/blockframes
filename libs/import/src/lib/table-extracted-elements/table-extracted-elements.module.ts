// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

// Components
import { TableExtractedContractsComponent } from './contracts/contracts.component';
import { TableExtractedMoviesComponent } from './movies/movies.component';
import { TableExtractedIncomesComponent } from './incomes/incomes.component';
import { TableExtractedOrganizationsComponent } from './organizations/organizations.component';
import { TableExtractedExpensesComponent } from './expenses/expenses.component';
import { ViewImportErrorsComponent } from './view-import-errors/view-import-errors.component';

@NgModule({
  declarations: [
    TableExtractedMoviesComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
    TableExtractedIncomesComponent,
    TableExtractedExpensesComponent,
    ViewImportErrorsComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GlobalModalModule,

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
    IsDisabledPipeModule,

  ],
  exports: [
    TableExtractedMoviesComponent,
    TableExtractedContractsComponent,
    TableExtractedOrganizationsComponent,
    TableExtractedIncomesComponent,
    TableExtractedExpensesComponent
  ],
})
export class TableExtractedElementsModule {}
