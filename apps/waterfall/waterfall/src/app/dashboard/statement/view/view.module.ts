// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';

// Components
import { StatementViewComponent } from './view.component';

@NgModule({
  declarations: [StatementViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementHeaderModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent }]),
  ],
})
export class StatementViewModule { }
