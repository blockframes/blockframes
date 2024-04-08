
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { ContractListModule } from '@blockframes/waterfall/components/document/contract/contract-list/contract-list.module';
import { BudgetListModule } from '@blockframes/waterfall/components/document/budget-list/budget-list.module';
import { FinancingPlanListModule } from '@blockframes/waterfall/components/document/financing-plan-list/financing-plan-list.module';
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';

// Pages
import { DocumentsComponent } from './documents.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    ContractListModule,
    BudgetListModule,
    FinancingPlanListModule,

    // Material
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      canActivate: [WaterfallAdminGuard], // Temp #9553 - remove once we allow non-admin to view documents
      component: DocumentsComponent
    }]),
  ],
})
export class DocumentsModule { }
