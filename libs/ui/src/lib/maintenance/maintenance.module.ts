import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
