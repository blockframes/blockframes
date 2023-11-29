// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { StatementDistributorSummaryModule } from '@blockframes/waterfall/components/statement-distributor/summary/summary.module';

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
    StatementHeaderModule,
    StatementDistributorSummaryModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent }]),
  ],
})
export class StatementViewModule { }
