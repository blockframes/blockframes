// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { StatementPeriodModule } from '@blockframes/waterfall/components/statement-period/statement-period.module';

// Components
import { StatementEditComponent } from './edit.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [StatementEditComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementHeaderModule,
    StatementPeriodModule,

    // Material
    MatButtonModule,
    MatIconModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementEditComponent }]),
  ],
})
export class StatementEditModule { }
