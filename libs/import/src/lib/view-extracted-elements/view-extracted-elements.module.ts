// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { TableExtractedElementsModule } from '../table-extracted-elements/table-extracted-elements.module';

// Components
import { ViewExtractedTitlesComponent } from './titles/view-extracted-titles.component';
import { ViewExtractedContractsComponent } from './contract/view-extracted-contracts.component';
import { ViewExtractedOrganizationsComponent } from './organizations/view-extracted-organizations.component';
import { ViewExtractedIncomesComponent } from './incomes/view-extracted-incomes.component';
import { ViewExtractedExpensesComponent } from './expenses/view-extracted-expenses.component';

@NgModule({
  declarations: [
    ViewExtractedTitlesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
    ViewExtractedIncomesComponent,
    ViewExtractedExpensesComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    TableExtractedElementsModule,

    // Material
    MatProgressSpinnerModule,
  ],
  exports: [
    ViewExtractedTitlesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
    ViewExtractedIncomesComponent,
    ViewExtractedExpensesComponent
  ],
})
export class ViewExtractedElementsModule {}
