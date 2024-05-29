// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementDistributorEditModule } from '@blockframes/waterfall/components/statement/statement-distributor/edit/edit.module';
import { StatementDirectSalesEditModule } from '@blockframes/waterfall/components/statement/statement-direct-sales/edit/edit.module';

// Guards
import { StatementFormGuard } from '@blockframes/waterfall/guards/statement-form.guard';

// Components
import { StatementEditComponent } from './edit.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementEditComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementDistributorEditModule,
    StatementDirectSalesEditModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementEditComponent, canDeactivate: [StatementFormGuard] }]),
  ],
})
export class StatementEditModule { }
