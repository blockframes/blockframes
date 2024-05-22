
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { ContractListModule } from '@blockframes/waterfall/components/document/contract/contract-list/contract-list.module';
import { BudgetListModule } from '@blockframes/waterfall/components/document/budget-list/budget-list.module';
import { FinancingPlanListModule } from '@blockframes/waterfall/components/document/financing-plan-list/financing-plan-list.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Pages
import { DocumentsComponent } from './documents.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Blockframes
    ContractListModule,
    BudgetListModule,
    FinancingPlanListModule,
    ImageModule,

    // Material
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,

    // Routing
    RouterModule.forChild([{ path: '', component: DocumentsComponent }]),
  ],
})
export class DocumentsModule { }
