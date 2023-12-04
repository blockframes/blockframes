// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementDistributorEditModule } from '@blockframes/waterfall/components/statement-distributor/edit/edit.module';
import { StatementDirectSalesEditModule } from '@blockframes/waterfall/components/statement-direct-sales/edit/edit.module';

// Guards
import { StatementFormGuard } from '@blockframes/waterfall/guards/statement-form.guard';

// Components
import { StatementEditComponent } from './edit.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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

    // Routing
    RouterModule.forChild([{ path: '', component: StatementEditComponent, canDeactivate: [StatementFormGuard] }]),
  ],
})
export class StatementEditModule { }
