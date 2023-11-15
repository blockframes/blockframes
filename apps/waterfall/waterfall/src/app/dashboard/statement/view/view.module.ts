// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';

// Components
import { StatementViewComponent } from './view.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StatementViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementHeaderModule,

    // Material
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent }]),
  ],
})
export class StatementViewModule { }
