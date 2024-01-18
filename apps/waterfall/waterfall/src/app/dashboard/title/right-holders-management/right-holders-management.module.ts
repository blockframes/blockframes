import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { RightHoldersManagementComponent } from './right-holders-management.component';

// Blockframes
import { RightHolderFormModule } from '@blockframes/waterfall/components/right-holder-form/right-holder-form.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    RightHoldersManagementComponent,
  ],
  imports: [
    CommonModule,

    RightHolderFormModule,
    
    // Material
    MatIconModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersManagementComponent }]),
  ],
})
export class RightHoldersManagementModule { }
