// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementDistributorSummaryModule } from '@blockframes/waterfall/components/statement/statement-distributor/summary/summary.module';
import { StatementProducerSummaryModule } from '@blockframes/waterfall/components/statement/statement-producer/summary/summary.module';
import { StatementDirectSalesSummaryModule } from '@blockframes/waterfall/components/statement/statement-direct-sales/summary/summary.module';

// Guards
import { StatementFormGuard } from '@blockframes/waterfall/guards/statement-form.guard';

// Components
import { StatementViewComponent } from './view.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementDistributorSummaryModule,
    StatementProducerSummaryModule,
    StatementDirectSalesSummaryModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent, canDeactivate: [StatementFormGuard] }]),
  ],
})
export class StatementViewModule { }
