// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { StatementDistributorEditModule } from '@blockframes/waterfall/components/statement-distributor/edit/edit.module';

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
    StatementHeaderModule,
    StatementDistributorEditModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementEditComponent, canDeactivate: [StatementFormGuard] }]),
  ],
})
export class StatementEditModule { }
