// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { StatementViewComponent } from './view.component';

// Material
@NgModule({
  declarations: [StatementViewComponent],
  imports: [
    CommonModule,
    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent }]),
  ],
})
export class StatementViewModule { }
