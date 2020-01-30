import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [MaintenanceComponent],
  imports: [
    CommonModule,
    // Material
    MatButtonModule,
    MatIconModule,
    // Router
    RouterModule.forChild([{ path: '', component: MaintenanceComponent }])
  ]
})
export class MaintenanceModule { }
