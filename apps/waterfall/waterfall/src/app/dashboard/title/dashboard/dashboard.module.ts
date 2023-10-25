// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { DashboardComponent } from './dashboard.component';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,

    // Material
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
  ],
})
export class DashboardModule { }
